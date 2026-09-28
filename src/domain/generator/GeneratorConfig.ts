import { InvalidGeneratorConfigError } from './errors';

/**
 * Upper bound on the number of distinct draws a scope may contain. Chosen so
 * every draw index is an exact integer (< 2^53) and fits a single uniform
 * random call (crypto.randomInt accepts ranges below 2^48).
 */
const MAX_COMBINATIONS = 2 ** 48 - 1;

interface GeneratorConfigProps {
  /** How many numbers make up one draw. */
  count: number;
  /** Smallest allowed number (inclusive). */
  min: number;
  /** Largest allowed number (inclusive). */
  max: number;
}

/**
 * Value object describing one generation scope: "`count` distinct integers
 * from `min`..`max`, order significant". Two configs with the same values are
 * the same scope and share the same issued-draw history.
 */
export class GeneratorConfig {
  readonly count: number;
  readonly min: number;
  readonly max: number;
  /** Size of the value pool (max - min + 1). */
  readonly poolSize: number;
  /** Number of distinct ordered draws: P(poolSize, count). */
  readonly combinations: number;

  private constructor(props: GeneratorConfigProps, poolSize: number, combinations: number) {
    this.count = props.count;
    this.min = props.min;
    this.max = props.max;
    this.poolSize = poolSize;
    this.combinations = combinations;
    Object.freeze(this);
  }

  static create(props: GeneratorConfigProps): GeneratorConfig {
    const { count, min, max } = props;
    for (const [name, value] of Object.entries({ count, min, max })) {
      if (!Number.isSafeInteger(value)) {
        throw new InvalidGeneratorConfigError(`"${name}" must be a safe integer, got ${value}.`);
      }
    }
    if (count < 1) throw new InvalidGeneratorConfigError('"count" must be at least 1.');
    if (max < min) throw new InvalidGeneratorConfigError('"max" must be greater than or equal to "min".');

    const poolSize = max - min + 1;
    if (count > poolSize) {
      throw new InvalidGeneratorConfigError(
        `Cannot pick ${count} distinct numbers from a pool of ${poolSize}.`,
      );
    }

    let combinations = 1;
    for (let i = 0; i < count; i++) {
      combinations *= poolSize - i;
      if (combinations > MAX_COMBINATIONS) {
        throw new InvalidGeneratorConfigError(
          `Scope is too large: more than ${MAX_COMBINATIONS} possible draws.`,
        );
      }
    }
    return new GeneratorConfig(props, poolSize, combinations);
  }

  /** Stable key identifying this scope in persistence. */
  get scope(): string {
    return `${this.count}-of-${this.min}..${this.max}`;
  }
}
