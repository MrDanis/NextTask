import type { Draw } from './Draw';

/**
 * Persistence of issued draws. Implementations own storage; the domain owns
 * the uniqueness rule. The one hard requirement on implementations is that
 * `tryRecord` is atomic: two concurrent calls for the same (scope, index) must
 * never both return true.
 */
export interface DrawRepository {
  /** Indices already issued in the scope, sorted ascending, without duplicates. */
  issuedIndices(scope: string): Promise<readonly number[]>;
  countIssued(scope: string): Promise<number>;
  /** Records the draw if its index is unused. Returns false if it was already issued. */
  tryRecord(draw: Draw): Promise<boolean>;
  /**
   * Marks an issued draw as used for sign-in, atomically: of two concurrent
   * calls for the same draw, only one gets 'redeemed'.
   */
  redeem(scope: string, index: number, userId: string, at: Date): Promise<RedeemResult>;
}

export type RedeemResult = 'redeemed' | 'notIssued' | 'alreadyRedeemed';

/** Source of uniformly distributed integers. */
export interface RandomSource {
  /** Uniform integer in [0, maxExclusive). */
  nextInt(maxExclusive: number): number;
}
