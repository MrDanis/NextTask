import { DomainError } from '../shared/DomainError';
import type { DrawViolation } from './Draw';

export class InvalidGeneratorConfigError extends DomainError {
  readonly code = 'INVALID_GENERATOR_CONFIG';
}

/** Every possible draw in the scope has been issued; issuing another would repeat one. */
export class RangeExhaustedError extends DomainError {
  readonly code = 'RANGE_EXHAUSTED';

  constructor(readonly scope: string, readonly combinations: number) {
    super(`All ${combinations} draws in scope "${scope}" have been issued.`);
  }
}

/**
 * The chosen draw was claimed by a concurrent request on every attempt.
 * Uniqueness still holds; the caller may simply retry.
 */
export class GenerationConflictError extends DomainError {
  readonly code = 'GENERATION_CONFLICT';

  constructor(readonly attempts: number) {
    super(`Could not claim an unused draw after ${attempts} attempts.`);
  }
}

/** A proposed draw breaks the scope's rules (wrong count, out of range, repeated number…). */
export class InvalidDrawError extends DomainError {
  readonly code = 'INVALID_DRAW';

  constructor(readonly violation: DrawViolation) {
    super(`Proposed draw is invalid: ${violation}.`);
  }
}

/** The proposed draw was issued before; issuing it again would be a repeat. */
export class DrawAlreadyIssuedError extends DomainError {
  readonly code = 'DRAW_ALREADY_ISSUED';

  constructor() {
    super('This draw has already been issued.');
  }
}
