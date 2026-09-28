import { getContainer } from '@/infrastructure/container';
import { PageShell } from '@/presentation/components/layout/PageShell';
import { NotFoundCard } from '@/presentation/components/not-found/NotFoundCard';
import { getDictionary } from '@/presentation/i18n/dictionaries';
import { getRequestLocale } from './_server/locale';
import { readSessionToken } from './_server/sessionCookie';

export default async function NotFound() {
  const { getCurrentUser } = await getContainer();
  const [locale, currentUser] = await Promise.all([
    getRequestLocale(),
    readSessionToken().then((token) => getCurrentUser.execute(token)),
  ]);
  return (
    <PageShell locale={locale} currentUser={currentUser}>
      <NotFoundCard copy={getDictionary(locale).notFound} />
    </PageShell>
  );
}
