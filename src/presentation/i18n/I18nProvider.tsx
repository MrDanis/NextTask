'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { Locale } from '@/shared/i18n/locale';
import { getDictionary, type Dictionary } from './dictionaries';

interface I18nValue {
  locale: Locale;
  t: Dictionary;
}

const I18nContext = createContext<I18nValue | null>(null);

/** Only the locale crosses the server/client boundary; the dictionary (which holds functions) is resolved here. */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  // <html lang> is rendered once by the root layout; keep it right after client-side navigation.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return <I18nContext.Provider value={{ locale, t: getDictionary(locale) }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>.');
  return value;
}
