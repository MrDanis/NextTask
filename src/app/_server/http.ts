import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import type { ApiErrorBody, ApiErrorCode } from '@/application/contract';

const HTTP_BY_DOMAIN_CODE = new Map<string, { status: number; code: ApiErrorCode }>([
  ['RANGE_EXHAUSTED', { status: 409, code: 'RANGE_EXHAUSTED' }],
  ['GENERATION_CONFLICT', { status: 503, code: 'GENERATION_CONFLICT' }],
  ['INVALID_DRAW', { status: 422, code: 'INVALID_DRAW' }],
  ['DRAW_ALREADY_ISSUED', { status: 409, code: 'DRAW_ALREADY_ISSUED' }],
  ['INVALID_CREDENTIALS', { status: 401, code: 'INVALID_CREDENTIALS' }],
  ['CODE_NOT_ISSUED', { status: 401, code: 'CODE_NOT_ISSUED' }],
  ['CODE_ALREADY_USED', { status: 401, code: 'CODE_ALREADY_USED' }],
]);

export function errorResponse(status: number, body: ApiErrorBody['error']): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: body }, { status, headers: { 'Cache-Control': 'no-store' } });
}

/**
 * Maps known domain errors to HTTP; anything else is logged and hidden behind
 * a generic 500. Matches on the stable `code`, not `instanceof`: Next bundles
 * route handlers and server components into separate chunks, so a class can
 * exist twice and instanceof silently fails.
 */
export function handleError(error: unknown): NextResponse<ApiErrorBody> {
  const code = error instanceof Error && 'code' in error ? String(error.code) : undefined;
  const mapped = code ? HTTP_BY_DOMAIN_CODE.get(code) : undefined;
  if (mapped) return errorResponse(mapped.status, { code: mapped.code });
  console.error(error);
  return errorResponse(500, { code: 'INTERNAL' });
}

/**
 * CSRF guard for cookie-authenticated mutations: browsers always send
 * `Origin` on cross-site POST/DELETE, so a mismatch means another site is
 * driving the request.
 */
export function isCrossSite(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  return origin !== null && origin !== request.nextUrl.origin;
}
