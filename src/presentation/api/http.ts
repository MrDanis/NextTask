import type { ApiErrorBody, ApiErrorCode } from '@/application/contract';

export type ClientErrorCode = ApiErrorCode | 'NETWORK';

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ClientErrorCode; fields?: ApiErrorBody['error']['fields'] };

function isErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiErrorBody).error?.code === 'string'
  );
}

/**
 * fetch() wrapper that never throws: transport failures become 'NETWORK',
 * unexpected server replies become 'INTERNAL'. Components only branch on codes.
 */
export async function request<T>(url: string, init: RequestInit): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, headers: { Accept: 'application/json', ...init.headers } });
  } catch {
    return { ok: false, code: 'NETWORK' };
  }

  const body: unknown = response.status === 204 ? null : await response.json().catch(() => null);
  if (response.ok) return { ok: true, data: body as T };
  if (isErrorBody(body)) return { ok: false, code: body.error.code, fields: body.error.fields };
  return { ok: false, code: 'INTERNAL' };
}
