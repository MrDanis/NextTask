export const LOCALES = ['en', 'de'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE = 'locale';
/** Request header the proxy uses to hand the resolved locale to the root layout. */
export const LOCALE_HEADER = 'x-locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Until the visitor picks a language, each screen uses the language it is
 * drawn in: Sign in in English, the generator in German.
 */
export function defaultLocaleForPath(pathname: string): Locale {
  return pathname.startsWith('/generator') ? 'de' : 'en';
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'de' : 'en';
}
