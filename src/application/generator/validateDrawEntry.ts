import type { GeneratorStatusDto } from './dto';

export type DrawEntryError = 'incomplete' | 'outOfRange' | 'duplicate';

interface DrawEntryCheck {
  /** The parsed numbers when every slot is filled and valid. */
  numbers: number[] | null;
  /** Slot indices per problem, so the UI can mark exactly the offending boxes. */
  problems: Record<DrawEntryError, number[]>;
}

/**
 * Checks what the user typed into the slots, for instant feedback. The same
 * rules are enforced again on the server by the domain (findDrawViolation),
 * which never trusts this result.
 */
export function checkDrawEntry(scope: Pick<GeneratorStatusDto, 'count' | 'min' | 'max'>, values: readonly string[]): DrawEntryCheck {
  const problems: DrawEntryCheck['problems'] = { incomplete: [], outOfRange: [], duplicate: [] };
  const parsed = Array.from({ length: scope.count }, (_, i) => {
    const raw = (values[i] ?? '').trim();
    if (!/^\d+$/.test(raw)) {
      problems.incomplete.push(i);
      return null;
    }
    const n = Number(raw);
    if (n < scope.min || n > scope.max) problems.outOfRange.push(i);
    return n;
  });

  parsed.forEach((n, i) => {
    if (n !== null && parsed.indexOf(n) !== parsed.lastIndexOf(n)) problems.duplicate.push(i);
  });

  const valid = Object.values(problems).every((list) => list.length === 0);
  return { numbers: valid ? (parsed as number[]) : null, problems };
}
