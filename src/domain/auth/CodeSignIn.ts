import type { GeneratorConfig } from '../generator/GeneratorConfig';
import { parseDrawCode } from '../generator/codes';
import { rankDraw } from '../generator/permutation';
import type { DrawRepository } from '../generator/ports';
import type { Clock } from '../shared/Clock';
import type { User } from './entities';
import { CodeAlreadyUsedError, CodeNotIssuedError } from './errors';

/**
 * Rules for signing in with a generated number used as a one-time code:
 *
 * - The code must be a draw that was actually issued, and not used before.
 *   Redemption is a single atomic update, so a code works exactly once even
 *   if two people submit it at the same moment.
 * - A code can never open an account that has a password (such as the demo
 *   account). Codes are public: anyone can generate one, so they must not
 *   unlock accounts protected by something stronger.
 */
export class CodeSignIn {
  constructor(
    private readonly draws: DrawRepository,
    private readonly config: GeneratorConfig,
    private readonly clock: Clock,
  ) {}

  /** Accounts with a password can only be entered with that password, never with a code. */
  static requiresPassword(user: User | null): user is User & { passwordHash: string } {
    return Boolean(user?.passwordHash);
  }

  isCode(password: string): boolean {
    return parseDrawCode(this.config, password) !== null;
  }

  /** Uses up the code for `userId`. Throws if it was never issued or already used. */
  async redeem(code: string, userId: string): Promise<void> {
    const numbers = parseDrawCode(this.config, code);
    if (!numbers) throw new CodeNotIssuedError();
    const result = await this.draws.redeem(this.config.scope, rankDraw(this.config, numbers), userId, this.clock.now());
    if (result === 'notIssued') throw new CodeNotIssuedError();
    if (result === 'alreadyRedeemed') throw new CodeAlreadyUsedError();
  }
}
