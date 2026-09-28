import { DomainError } from '../shared/DomainError';

/** Deliberately does not say whether the email or the password was wrong. */
export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';

  constructor() {
    super('Email or password is incorrect.');
  }
}

/** The pasted number was never generated here, so it can't be used to sign in. */
export class CodeNotIssuedError extends DomainError {
  readonly code = 'CODE_NOT_ISSUED';

  constructor() {
    super('This number has not been issued.');
  }
}

/** The number was already used to sign in once. */
export class CodeAlreadyUsedError extends DomainError {
  readonly code = 'CODE_ALREADY_USED';

  constructor() {
    super('This number has already been used to sign in.');
  }
}
