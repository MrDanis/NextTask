import type { SignInFieldErrors } from './auth/validateSignIn';

/**
 * Error codes the HTTP API can return. Shared by the route handlers and the
 * browser clients so both sides agree on a closed set; the UI translates each
 * code into a message.
 */
export type ApiErrorCode =
  | 'RANGE_EXHAUSTED'
  | 'GENERATION_CONFLICT'
  | 'INVALID_DRAW'
  | 'DRAW_ALREADY_ISSUED'
  | 'VALIDATION_FAILED'
  | 'INVALID_CREDENTIALS'
  | 'CODE_NOT_ISSUED'
  | 'CODE_ALREADY_USED'
  | 'FORBIDDEN'
  | 'INTERNAL';

export interface ApiErrorBody {
  error: { code: ApiErrorCode; fields?: SignInFieldErrors };
}
