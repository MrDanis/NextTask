import type { GeneratorConfig } from './GeneratorConfig';

/*
 * Bijection between draw indices [0, combinations) and ordered draws of
 * `count` distinct values from min..max, in lexicographic order.
 *
 * Working with indices is what makes the uniqueness guarantee cheap: the
 * issued-draw history is a set of integers, "is this draw new?" is set
 * membership, and "pick a random unused draw" is "pick the r-th integer that
 * is not in the set".
 */

/** Number of ways to arrange the remaining positions after position `i`. */
function suffixArrangements(config: GeneratorConfig, i: number): number {
  let n = 1;
  for (let j = i + 1; j < config.count; j++) n *= config.poolSize - j;
  return n;
}

export function unrankDraw(config: GeneratorConfig, index: number): number[] {
  if (!Number.isSafeInteger(index) || index < 0 || index >= config.combinations) {
    throw new RangeError(`Draw index ${index} is outside [0, ${config.combinations}).`);
  }
  const pool = Array.from({ length: config.poolSize }, (_, k) => config.min + k);
  const values: number[] = [];
  let rest = index;
  for (let i = 0; i < config.count; i++) {
    const block = suffixArrangements(config, i);
    const pick = Math.floor(rest / block);
    rest -= pick * block;
    values.push(pool.splice(pick, 1)[0]!);
  }
  return values;
}

export function rankDraw(config: GeneratorConfig, values: readonly number[]): number {
  if (values.length !== config.count) {
    throw new RangeError(`Expected ${config.count} values, got ${values.length}.`);
  }
  const pool = Array.from({ length: config.poolSize }, (_, k) => config.min + k);
  let index = 0;
  values.forEach((value, i) => {
    const pick = pool.indexOf(value);
    if (pick === -1) throw new RangeError(`Value ${value} is out of range or repeated.`);
    pool.splice(pick, 1);
    index += pick * suffixArrangements(config, i);
  });
  return index;
}

/**
 * Returns the `r`-th (0-based) integer that does not appear in `issued`.
 * `issued` must be sorted ascending and contain no duplicates.
 *
 * Walking the sorted list shifts the candidate past every issued index at or
 * below it, so the result is never an issued index. O(issued.length).
 */
export function nthUnusedIndex(issued: readonly number[], r: number): number {
  let candidate = r;
  for (const used of issued) {
    if (used > candidate) break;
    candidate++;
  }
  return candidate;
}
