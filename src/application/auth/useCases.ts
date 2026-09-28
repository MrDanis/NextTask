import { CodeSignIn } from '@/domain/auth/CodeSignIn';
import { SESSION_TTL_MS } from '@/domain/auth/entities';
import { InvalidCredentialsError } from '@/domain/auth/errors';
import type { PasswordHasher, SessionRepository, TokenService, UserRepository } from '@/domain/auth/ports';
import { normalizeEmail } from '@/domain/auth/credentials';
import type { Clock } from '@/domain/shared/Clock';
import type { SignInInput } from './validateSignIn';

export interface CurrentUserDto {
  email: string;
}

interface IssuedSession {
  token: string;
  expiresAt: Date;
}

interface AuthDeps {
  users: UserRepository;
  sessions: SessionRepository;
  hasher: PasswordHasher;
  tokens: TokenService;
  clock: Clock;
  codes: CodeSignIn;
}

export class SignIn {
  private dummyHash: Promise<string> | null = null;

  constructor(private readonly deps: AuthDeps) {}

  /**
   * `input` must already have passed `validateSignIn`.
   *
   * Two ways in:
   * - an account with a password: the password must match (the demo account);
   * - any other email: the "password" may be a generated number used as a
   *   one-time code. A new email gets an account on first use.
   */
  async execute(input: SignInInput): Promise<IssuedSession> {
    const { users, hasher, codes, tokens } = this.deps;
    const user = await users.findByEmail(input.email);

    if (CodeSignIn.requiresPassword(user)) {
      if (!(await hasher.verify(input.password, user.passwordHash))) throw new InvalidCredentialsError();
      return this.startSession(user.id);
    }

    if (!codes.isCode(input.password)) {
      await this.spendEqualTime(input.password);
      throw new InvalidCredentialsError();
    }

    // Redeem first: the account is only created once the code is known to be good.
    const userId = user?.id ?? tokens.newId();
    await codes.redeem(input.password, userId);
    if (user) return this.startSession(user.id);

    await users.saveIfAbsent({ id: userId, email: input.email, passwordHash: null });
    // Re-read: a concurrent sign-in may have created this email first.
    const account = await users.findByEmail(input.email);
    return this.startSession(account?.id ?? userId);
  }

  /** A miss costs as much as a wrong password, so timing doesn't reveal which emails exist. */
  private async spendEqualTime(password: string) {
    this.dummyHash ??= this.deps.hasher.hash('timing-equalizer');
    await this.deps.hasher.verify(password, await this.dummyHash);
  }

  private async startSession(userId: string): Promise<IssuedSession> {
    const { sessions, tokens, clock } = this.deps;
    const now = clock.now();
    await sessions.deleteExpired(now);
    const token = tokens.generate();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
    await sessions.save({ tokenHash: tokens.hash(token), userId, expiresAt });
    return { token, expiresAt };
  }
}

export class SignOut {
  constructor(private readonly deps: Pick<AuthDeps, 'sessions' | 'tokens'>) {}

  async execute(token: string | undefined): Promise<void> {
    if (token) await this.deps.sessions.delete(this.deps.tokens.hash(token));
  }
}

export class GetCurrentUser {
  constructor(private readonly deps: Pick<AuthDeps, 'sessions' | 'tokens' | 'users' | 'clock'>) {}

  async execute(token: string | undefined): Promise<CurrentUserDto | null> {
    if (!token) return null;
    const { sessions, tokens, users, clock } = this.deps;
    const session = await sessions.findActive(tokens.hash(token), clock.now());
    if (!session) return null;
    const user = await users.findById(session.userId);
    return user ? { email: user.email } : null;
  }
}

/** Creates the demo account on first start. Idempotent. */
export class SeedDemoUser {
  constructor(private readonly deps: Pick<AuthDeps, 'users' | 'hasher' | 'tokens'>) {}

  async execute(email: string, password: string): Promise<void> {
    const normalized = normalizeEmail(email);
    if (await this.deps.users.findByEmail(normalized)) return;
    await this.deps.users.saveIfAbsent({
      id: this.deps.tokens.newId(),
      email: normalized,
      passwordHash: await this.deps.hasher.hash(password),
    });
  }
}
