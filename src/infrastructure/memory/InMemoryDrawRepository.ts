import type { Draw } from '@/domain/generator/Draw';
import type { DrawRepository, RedeemResult } from '@/domain/generator/ports';

interface StoredDraw {
  draw: Draw;
  redeemedAt: Date | null;
  redeemedBy: string | null;
}

/**
 * Process memory store. Each method checks and writes without an `await` in
 * between, so on Node's single thread `tryRecord` and `redeem` are atomic:
 * two concurrent calls can never both succeed.
 */
export class InMemoryDrawRepository implements DrawRepository {
  private readonly scopes = new Map<string, Map<number, StoredDraw>>();

  private scope(scope: string): Map<number, StoredDraw> {
    let draws = this.scopes.get(scope);
    if (!draws) this.scopes.set(scope, (draws = new Map()));
    return draws;
  }

  async issuedIndices(scope: string): Promise<readonly number[]> {
    return [...this.scope(scope).keys()].sort((a, b) => a - b);
  }

  async countIssued(scope: string): Promise<number> {
    return this.scope(scope).size;
  }

  async tryRecord(draw: Draw): Promise<boolean> {
    const draws = this.scope(draw.scope);
    if (draws.has(draw.index)) return false;
    draws.set(draw.index, { draw, redeemedAt: null, redeemedBy: null });
    return true;
  }

  async redeem(scope: string, index: number, userId: string, at: Date): Promise<RedeemResult> {
    const stored = this.scope(scope).get(index);
    if (!stored) return 'notIssued';
    if (stored.redeemedAt) return 'alreadyRedeemed';
    stored.redeemedAt = at;
    stored.redeemedBy = userId;
    return 'redeemed';
  }
}
