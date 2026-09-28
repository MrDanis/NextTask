import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  isValidEmail,
  normalizeEmail,
} from '@/domain/auth/credentials';

export type EmailError = 'required' | 'invalid';
export type PasswordError = 'required' | 'tooShort' | 'tooLong';

export interface SignInFieldErrors {
  email?: EmailError;
  password?: PasswordError;
}

export interface SignInInput {
  email: string;
  password: string;
}

type SignInValidation =
  | { ok: true; value: SignInInput }
  | { ok: false; errors: SignInFieldErrors };

/**
 * Runs on the client for instant feedback and again on the server, which never
 * trusts the client. Returns error *codes*; wording is a presentation concern.
 */
export function validateSignIn(raw: unknown): SignInValidation {
  const input = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const email = normalizeEmail(typeof input.email === 'string' ? input.email : '');
  // Passwords are never trimmed: leading/trailing spaces are legitimate characters.
  const password = typeof input.password === 'string' ? input.password : '';

  const errors: SignInFieldErrors = {};
  if (!email) errors.email = 'required';
  else if (!isValidEmail(email)) errors.email = 'invalid';

  if (!password) errors.password = 'required';
  else if (password.length < PASSWORD_MIN_LENGTH) errors.password = 'tooShort';
  else if (password.length > PASSWORD_MAX_LENGTH) errors.password = 'tooLong';

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: { email, password } };
}
