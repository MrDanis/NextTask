/*
 * Credential rules shared by sign-in validation on both the client (instant
 * feedback) and the server (authoritative). Pure functions, no I/O.
 */

/** From the design's password placeholder: "6+ characters". */
export const PASSWORD_MIN_LENGTH = 6;
/** Bounds hashing cost for hostile input. */
export const PASSWORD_MAX_LENGTH = 128;
const EMAIL_MAX_LENGTH = 254;

// Deliberately pragmatic: one "@", no whitespace, a dot in the domain. Full
// RFC 5322 validation rejects nothing useful here; the account lookup is the
// real check.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(normalized: string): boolean {
  return normalized.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(normalized);
}
