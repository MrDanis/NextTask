'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { LOCALE_COOKIE, otherLocale, type Locale } from '@/shared/i18n/locale';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Persists the choice in a cookie (so the server renders it next time) and re-renders the current route in place. */
export function useLocaleSwitch(current: Locale) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    document.cookie = `${LOCALE_COOKIE}=${otherLocale(current)}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return { toggle, pending };
}
