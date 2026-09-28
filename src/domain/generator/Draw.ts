import type { GeneratorConfig } from './GeneratorConfig';
import { unrankDraw } from './permutation';

/** One issued result: an ordered set of distinct numbers, unique within its scope. */
export interface Draw {
  readonly scope: string;
  /** Position of this draw in the scope's lexicographic order; the identity used for uniqueness. */
  readonly index: number;
  readonly numbers: readonly number[];
  readonly issuedAt: Date;
}

export function createDraw(config: GeneratorConfig, index: number, issuedAt: Date): Draw {
  return Object.freeze({
    scope: config.scope,
    index,
    numbers: Object.freeze(unrankDraw(config, index)),
    issuedAt,
  });
}

/** Why a proposed draw is not a valid member of the scope. */
export type DrawViolation = 'wrongCount' | 'notInteger' | 'outOfRange' | 'duplicate';

/**
 * The same rules a generated draw satisfies by construction, checked for a
 * draw proposed from outside (e.g. typed by the user). Null means valid.
 */
export function findDrawViolation(config: GeneratorConfig, numbers: readonly unknown[]): DrawViolation | null {
  if (numbers.length !== config.count) return 'wrongCount';
  if (!numbers.every((n): n is number => Number.isSafeInteger(n))) return 'notInteger';
  if (numbers.some((n) => n < config.min || n > config.max)) return 'outOfRange';
  if (new Set(numbers).size !== numbers.length) return 'duplicate';
  return null;
}
