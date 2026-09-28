import Image from 'next/image';
import type { ReactNode } from 'react';
import type { CurrentUserDto } from '@/application/auth/useCases';
import type { Locale } from '@/shared/i18n/locale';
import { I18nProvider } from '../../i18n/I18nProvider';
import { Header } from './Header';
import styles from './PageShell.module.css';

interface PageShellProps {
  /**
   * Resolved per request by the proxy. Provided here rather than in the root
   * layout because layouts are kept across client-side navigation, which would
   * freeze the language of the first page visited.
   */
  locale: Locale;
  currentUser: CurrentUserDto | null;
  /** Shows the settings icon beside the flag (generator screen only). */
  showSettings?: boolean;
  children: ReactNode;
}

export function PageShell({ locale, currentUser, showSettings = false, children }: PageShellProps) {
  return (
    <I18nProvider locale={locale}>
      <div className={styles.page}>
        <div className={styles.backdrop} aria-hidden="true">
          {/* Already a 42 KB JPEG and blurred 40px on screen: re-encoding it would buy nothing. */}
          <div className={styles.backdropFrame}>
            <Image
              src="/images/backdrop.jpg"
              alt=""
              fill
              priority
              unoptimized
              sizes="100vw"
              className={styles.backdropImage}
            />
          </div>
        </div>
        <Header currentUser={currentUser} showSettings={showSettings} />
        <main className={styles.main}>{children}</main>
      </div>
    </I18nProvider>
  );
}
