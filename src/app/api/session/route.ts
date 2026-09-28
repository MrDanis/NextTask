import { NextResponse, type NextRequest } from 'next/server';
import type { CurrentUserDto } from '@/application/auth/useCases';
import { validateSignIn } from '@/application/auth/validateSignIn';
import { getContainer } from '@/infrastructure/container';
import { errorResponse, handleError, isCrossSite } from '../../_server/http';
import { SESSION_COOKIE } from '../../_server/sessionCookie';

/** Sign in. */
export async function POST(request: NextRequest) {
  if (isCrossSite(request)) return errorResponse(403, { code: 'FORBIDDEN' });

  const body: unknown = await request.json().catch(() => null);
  const validation = validateSignIn(body);
  if (!validation.ok) return errorResponse(422, { code: 'VALIDATION_FAILED', fields: validation.errors });

  try {
    const { signIn } = await getContainer();
    const session = await signIn.execute(validation.value);
    const response = NextResponse.json<CurrentUserDto>({ email: validation.value.email });
    response.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: 'lax',
      // Follows the actual protocol (Safari drops Secure cookies on http://localhost),
      // including behind a TLS-terminating proxy.
      secure: request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https',
      path: '/',
      expires: session.expiresAt,
    });
    return response;
  } catch (error) {
    return handleError(error);
  }
}

/** Sign out. Idempotent: succeeds even without a session. */
export async function DELETE(request: NextRequest) {
  if (isCrossSite(request)) return errorResponse(403, { code: 'FORBIDDEN' });
  try {
    const { signOut } = await getContainer();
    await signOut.execute(request.cookies.get(SESSION_COOKIE)?.value);
    const response = new NextResponse(null, { status: 204 });
    response.cookies.delete(SESSION_COOKIE);
    return response;
  } catch (error) {
    return handleError(error);
  }
}
