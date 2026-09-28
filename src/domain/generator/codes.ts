import { findDrawViolation } from './Draw';
import type { GeneratorConfig } from './GeneratorConfig';

/*
 * A draw written as a code: its numbers side by side, e.g. [3,8,0,5,9,1] → "380591".
 * This is what the user copies and pastes into the sign-in password field.
 * Only unambiguous when every number is a single digit (the design's 0–9 scope).
 */

/** Null when the scope's numbers aren't single digits (a code would be ambiguous). */
export function formatDrawCode(config: GeneratorConfig, numbers: readonly number[]): string | null {
  return config.min < 0 || config.max > 9 ? null : numbers.join('');
}

/** The draw a code stands for, or null if the string can't be a code in this scope. */
export function parseDrawCode(config: GeneratorConfig, code: string): number[] | null {
  if (config.min < 0 || config.max > 9) return null;
  if (!new RegExp(`^\\d{${config.count}}$`).test(code)) return null;
  const numbers = [...code].map(Number);
  return findDrawViolation(config, numbers) ? null : numbers;
}
