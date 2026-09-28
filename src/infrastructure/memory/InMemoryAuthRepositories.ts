import type { Session, User } from '@/domain/auth/entities';
import type { SessionRepository, UserRepository } from '@/domain/auth/ports';

export class InMemoryUserRepository implements UserRepository {
  private readonly byId = new Map<string, User>();

  async findByEmail(email: string): Promise<User | null> {
    return this.lookupEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.byId.get(id) ?? null;
  }

  // Synchronous check-then-set: no await in between, so concurrent calls can't both insert.
  async saveIfAbsent(user: User): Promise<void> {
    if (this.lookupEmail(user.email) || this.byId.has(user.id)) return;
    this.byId.set(user.id, user);
  }

  private lookupEmail(email: string): User | null {
    for (const user of this.byId.values()) if (user.email === email) return user;
    return null;
  }
}

export class InMemorySessionRepository implements SessionRepository {
  private readonly byTokenHash = new Map<string, Session>();

  async save(session: Session): Promise<void> {
    this.byTokenHash.set(session.tokenHash, session);
  }

  async findActive(tokenHash: string, now: Date): Promise<Session | null> {
    const session = this.byTokenHash.get(tokenHash);
    return session && session.expiresAt > now ? session : null;
  }

  async delete(tokenHash: string): Promise<void> {
    this.byTokenHash.delete(tokenHash);
  }

  async deleteExpired(now: Date): Promise<void> {
    for (const [tokenHash, session] of this.byTokenHash) {
      if (session.expiresAt <= now) this.byTokenHash.delete(tokenHash);
    }
  }
}
