'use client';

import { useCallback, useRef, useState } from 'react';
import type { DrawDto, GeneratorStatusDto } from '@/application/generator/dto';
import { checkDrawEntry, type DrawEntryError } from '@/application/generator/validateDrawEntry';
import type { ClientErrorCode } from '../api/http';

type GeneratorError = 'exhausted' | 'conflict' | 'alreadyIssued' | 'invalid' | 'network' | 'internal';

type DrawResult = { ok: true; data: DrawDto } | { ok: false; code: ClientErrorCode };
type CreateDraw = () => Promise<DrawResult>;
type ClaimDraw = (numbers: number[]) => Promise<DrawResult>;

/** What a submit led to: a box to focus (entry not ready), or the draw that was issued (null if refused). */
type SubmitOutcome = { focusSlot: number } | { issued: DrawDto | null };

/** A keystroke or paste that was refused because the number is already in another box. */
interface RejectedEntry {
  value: string;
  /** Box that already holds the value. */
  slot: number;
}

interface GeneratorViewState {
  /** Last issued draw (generated or typed). */
  numbers: readonly number[] | null;
  /** `numbers` as a one-time sign-in code, for copying. */
  code: string | null;
  rejected: RejectedEntry | null;
  /** Changes with every new draw; used to replay the reveal animation. */
  drawKey: string | null;
  /** What the user is typing into the slots; null while they show `numbers`. */
  draft: string[] | null;
  /** Set by a submit attempt, so "fill in every box" only appears once they tried. */
  attempted: boolean;
  loading: boolean;
  exhausted: boolean;
  error: GeneratorError | null;
}

interface Options {
  scope: Pick<GeneratorStatusDto, 'count' | 'min' | 'max'>;
  initiallyExhausted: boolean;
  createDraw: CreateDraw;
  claimDraw: ClaimDraw;
}

function toError(code: ClientErrorCode): GeneratorError {
  switch (code) {
    case 'RANGE_EXHAUSTED':
      return 'exhausted';
    case 'GENERATION_CONFLICT':
      return 'conflict';
    case 'DRAW_ALREADY_ISSUED':
      return 'alreadyIssued';
    case 'INVALID_DRAW':
      return 'invalid';
    case 'NETWORK':
      return 'network';
    default:
      return 'internal';
  }
}

/**
 * Presentation state for the generator card. The user can either press the
 * button for a random draw, or type their own numbers into the slots and
 * submit them. Either way the server decides; this hook has no idea how
 * uniqueness is achieved, it only gives instant feedback on obvious mistakes
 * (empty box, repeated number, out of range).
 *
 * Every visit starts with empty boxes: nothing is restored from earlier visits.
 */
export function useNumberGenerator({ scope, initiallyExhausted, createDraw, claimDraw }: Options) {
  const { count } = scope;
  const [state, setState] = useState<GeneratorViewState>({
    numbers: null,
    code: null,
    rejected: null,
    drawKey: null,
    draft: null,
    attempted: false,
    loading: false,
    exhausted: initiallyExhausted,
    error: initiallyExhausted ? 'exhausted' : null,
  });
  // A ref, not state: two clicks in the same tick must see the flag immediately.
  const inFlight = useRef(false);
  const slots = state.draft ?? (state.numbers ? state.numbers.map(String) : Array<string>(count).fill(''));
  // Typing mode only while at least one box holds something; clearing them all returns to random.
  const manual = state.draft !== null && state.draft.some((v) => v !== '');
  const check = manual ? checkDrawEntry(scope, slots) : null;

  // A refused keystroke, repeats and out-of-range show while typing; "incomplete" only after a submit attempt.
  let entryError: DrawEntryError | 'repeated' | null = null;
  let invalidSlots: number[] = [];
  if (state.rejected) {
    entryError = 'repeated';
    invalidSlots = [state.rejected.slot];
  } else if (check) {
    const shown = (['duplicate', 'outOfRange', ...(state.attempted ? ['incomplete' as const] : [])] as const).find(
      (kind) => check.problems[kind].length > 0,
    );
    if (shown) {
      entryError = shown;
      invalidSlots = check.problems[shown];
    }
  }

  const setSlots = useCallback(
    (update: (current: string[]) => string[]) =>
      setState((s) => {
        const current = s.draft ?? (s.numbers ? s.numbers.map(String) : Array<string>(count).fill(''));
        return { ...s, draft: update([...current]), rejected: null, attempted: false, error: s.exhausted ? s.error : null };
      }),
    [count],
  );

  /** Resolves with the issued draw, or null if nothing was issued. */
  const request = useCallback(async (send: () => Promise<DrawResult>): Promise<DrawDto | null> => {
    if (inFlight.current) return null;
    inFlight.current = true;
    setState((s) => ({ ...s, loading: true, error: s.exhausted ? s.error : null }));

    const result = await send();
    inFlight.current = false;

    if (result.ok) {
      const { numbers, issuedAt, code, remaining } = result.data;
      setState({
        numbers,
        code,
        rejected: null,
        drawKey: issuedAt,
        draft: null,
        attempted: false,
        loading: false,
        exhausted: remaining <= 0,
        error: remaining <= 0 ? 'exhausted' : null,
      });
      return result.data;
    }
    // The draft is kept so the user can change one number and try again.
    const error = toError(result.code);
    setState((s) => ({ ...s, loading: false, error, exhausted: s.exhausted || error === 'exhausted' }));
    return null;
  }, []);

  /**
   * Random draw when the boxes are untouched, otherwise submits what was typed.
   * Returns the slot to focus when the typed entry isn't ready to send.
   */
  const submit = useCallback(async (): Promise<SubmitOutcome> => {
    if (!manual) return { issued: await request(createDraw) };
    if (!check?.numbers) {
      setState((s) => ({ ...s, attempted: true }));
      const first = check ? Math.min(...Object.values(check.problems).flat()) : 0;
      return { focusSlot: first };
    }
    const numbers = check.numbers;
    return { issued: await request(() => claimDraw(numbers)) };
  }, [manual, check, request, createDraw, claimDraw]);

  return {
    ...state,
    slots,
    manual,
    entryError,
    invalidSlots,
    /**
     * Sets one box. A number already in another box is refused (returns false)
     * and that other box is pointed out, instead of letting a duplicate in.
     */
    setSlot: (index: number, value: string): boolean => {
      const clash = value === '' ? -1 : slots.findIndex((v, i) => i !== index && v === value);
      if (clash !== -1) {
        setState((s) => ({ ...s, rejected: { value, slot: clash } }));
        return false;
      }
      setSlots((current) => {
        current[index] = value;
        return current;
      });
      return true;
    },
    /** Fills consecutive boxes from `start` (paste). Refused as a whole if it would repeat a number. */
    fillFrom: (start: number, values: string[]): boolean => {
      const next = [...slots];
      values.slice(0, count - start).forEach((value, i) => (next[start + i] = value));
      const clash = next.findIndex((v, i) => v !== '' && next.indexOf(v) !== i);
      if (clash !== -1) {
        const value = next[clash]!;
        setState((s) => ({ ...s, rejected: { value, slot: next.indexOf(value) } }));
        return false;
      }
      setSlots(() => next);
      return true;
    },
    /** The issued draw's code while it is on screen (not while the user is typing a new one). */
    copyableCode: manual ? null : state.code,
    submit,
  };
}
