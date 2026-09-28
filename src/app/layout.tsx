import type { Metadata, Viewport } from 'next';
import { Barlow, Outfit, Public_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { getDictionary } from '@/presentation/i18n/dictionaries';
import { getRequestLocale } from './_server/locale';
import '@/presentation/styles/globals.css';

// Self-hosted at build time: same faces and weights as the design's Google
// Fonts link, without the third-party request or a font-swap layout shift.
const publicSans = Public_Sans({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-public-sans' });
const barlow = Barlow({ subsets: ['latin'], weight: ['600'], variable: '--font-barlow' });
const outfit = Outfit({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-outfit' });

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getRequestLocale());
  return { title: 'TJ Labs', description: t.meta.description };
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ffffff' };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getRequestLocale();
  return (
    <html lang={locale} className={`${publicSans.variable} ${barlow.variable} ${outfit.variable}`}>
      {/* Browser extensions (e.g. Grammarly) inject attributes on <body> before hydration. */}
      <body suppressHydrationWarning>
        {/* The language is provided per page (PageShell): layouts persist across client navigation. */}
        {children}
      </body>
    </html>
  );
}
