/**
 * Base class for business-rule violations. `code` is a stable identifier the
 * outer layers map to HTTP statuses and translated messages; `message` is for
 * logs and developers only.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
