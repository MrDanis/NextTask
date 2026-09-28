import { NextResponse, type NextRequest } from 'next/server';
import { LOCALE_COOKIE, LOCALE_HEADER, defaultLocaleForPath, isLocale } from '@/shared/i18n/locale';

/**
 * Resolves the UI language before rendering so the root layout can set
 * <html lang> and render the right copy on the first paint (no flash of the
 * wrong language). The visitor's cookie wins; otherwise the screen's own default.
 */
export function proxy(request: NextRequest) {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookie) ? cookie : defaultLocaleForPath(request.nextUrl.pathname);
  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, locale);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
};
