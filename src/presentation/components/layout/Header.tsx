'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CurrentUserDto } from '@/application/auth/useCases';
import { sessionClient } from '../../api/clients';
import { useLocaleSwitch } from '../../hooks/useLocaleSwitch';
import { useI18n } from '../../i18n/I18nProvider';
import styles from './Header.module.css';

export function Header({ currentUser }: { currentUser: CurrentUserDto | null }) {
  const { locale, t } = useI18n();
  const language = useLocaleSwitch(locale);

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.wordmark} aria-label={t.header.home}>
        <span className={styles.brand}>TJ</span> LABS
      </Link>
      <div className={styles.actions}>
        {currentUser && <SignOutButton label={t.header.signOut} />}
        <button
          type="button"
          className={styles.language}
          aria-label={t.header.language}
          aria-busy={language.pending || undefined}
          onClick={language.toggle}
        >
          <Image
            src={locale === 'de' ? '/images/flag-de.png' : '/images/flag-en.png'}
            alt=""
            width={locale === 'de' ? 34 : 28}
            height={20}
            // Above the fold on every screen: lazy loading made it pop in after navigation.
            loading="eager"
            className={styles.flag}
            data-locale={locale}
          />
        </button>
      </div>
    </header>
  );
}

function SignOutButton({ label }: { label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await sessionClient.signOut();
    setPending(false);
    router.refresh();
  }

  return (
    <button type="button" className={styles.signOut} onClick={signOut} disabled={pending} aria-busy={pending || undefined}>
      {label}
    </button>
  );
}
