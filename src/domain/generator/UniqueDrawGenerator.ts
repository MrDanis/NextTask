import { createDraw, findDrawViolation, type Draw } from './Draw';
import type { GeneratorConfig } from './GeneratorConfig';
import { DrawAlreadyIssuedError, GenerationConflictError, InvalidDrawError, RangeExhaustedError } from './errors';
import { nthUnusedIndex, rankDraw } from './permutation';
import type { Clock } from '../shared/Clock';
import type { DrawRepository, RandomSource } from './ports';

const DEFAULT_MAX_ATTEMPTS = 8;

/**
 * Issues draws that never repeat within a scope.
 *
 * Strategy:
 *  1. Read the set of issued indices.
 *  2. Pick r uniformly from the *remaining* count and map it to the r-th
 *     unused index. Every unused draw is equally likely, and the candidate is
 *     unused by construction, so no rejection loop is needed however full the
 *     scope is.
 *  3. Claim it with the repository's atomic `tryRecord`. If a concurrent
 *     request claimed the same index between steps 1 and 3, re-read and try
 *     again.
 *
 * Uniqueness therefore rests on the repository's atomic insert (a synchronous
 * check-and-set in memory), never on the randomness. Exhaustion is detected before any pick,
 * so a full scope fails with RangeExhaustedError instead of repeating.
 *
 * `claim` issues a draw the user chose instead of a random one. It goes
 * through the same rules and the same atomic insert, so a typed draw can no
 * more repeat than a generated one.
 */
export class UniqueDrawGenerator {
  constructor(
    private readonly repository: DrawRepository,
    private readonly random: RandomSource,
    private readonly clock: Clock,
    private readonly maxAttempts = DEFAULT_MAX_ATTEMPTS,
  ) {}

  async generate(config: GeneratorConfig): Promise<Draw> {
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      const issued = await this.repository.issuedIndices(config.scope);
      const remaining = config.combinations - issued.length;
      if (remaining <= 0) throw new RangeExhaustedError(config.scope, config.combinations);

      const index = nthUnusedIndex(issued, this.random.nextInt(remaining));
      const draw = createDraw(config, index, this.clock.now());
      if (await this.repository.tryRecord(draw)) return draw;
    }
    throw new GenerationConflictError(this.maxAttempts);
  }

  async claim(config: GeneratorConfig, numbers: readonly unknown[]): Promise<Draw> {
    const violation = findDrawViolation(config, numbers);
    if (violation) throw new InvalidDrawError(violation);

    const draw = createDraw(config, rankDraw(config, numbers as readonly number[]), this.clock.now());
    if (await this.repository.tryRecord(draw)) return draw;

    // Not recorded: it was issued before. Say "exhausted" if nothing at all is left.
    if ((await this.repository.countIssued(config.scope)) >= config.combinations) {
      throw new RangeExhaustedError(config.scope, config.combinations);
    }
    throw new DrawAlreadyIssuedError();
  }
}
