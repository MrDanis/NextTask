export interface User {
  readonly id: string;
  /** Normalized (trimmed, lower-case). */
  readonly email: string;
  /** Null for accounts created by signing in with a one-time code. */
  readonly passwordHash: string | null;
}

export interface Session {
  /** Only a hash of the bearer token is stored, so a leaked session store cannot be replayed as cookies. */
  readonly tokenHash: string;
  readonly userId: string;
  readonly expiresAt: Date;
}

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
