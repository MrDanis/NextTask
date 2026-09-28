import type { Session, User } from './entities';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  /** Inserts the user unless one with the same email exists. */
  saveIfAbsent(user: User): Promise<void>;
}

export interface SessionRepository {
  save(session: Session): Promise<void>;
  /** Returns the session only if it exists and has not expired at `now`. */
  findActive(tokenHash: string, now: Date): Promise<Session | null>;
  delete(tokenHash: string): Promise<void>;
  deleteExpired(now: Date): Promise<void>;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

export interface TokenService {
  /** Unguessable bearer token for the session cookie. */
  generate(): string;
  /** Deterministic, one-way hash used as the storage key. */
  hash(token: string): string;
  newId(): string;
}
