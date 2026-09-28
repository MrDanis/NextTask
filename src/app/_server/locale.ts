import 'server-only';
import { headers } from 'next/headers';
import { LOCALE_HEADER, isLocale, type Locale } from '@/shared/i18n/locale';

/** Locale resolved by `src/proxy.ts` for this request. */
export async function getRequestLocale(): Promise<Locale> {
  const value = (await headers()).get(LOCALE_HEADER);
  return isLocale(value) ? value : 'en';
}
