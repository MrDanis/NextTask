import type { Metadata } from 'next';
import { getContainer } from '@/infrastructure/container';
import { GeneratorPanel } from '@/presentation/components/generator/GeneratorPanel';
import { PageShell } from '@/presentation/components/layout/PageShell';
import { getDictionary } from '@/presentation/i18n/dictionaries';
import { getRequestLocale } from '../_server/locale';
import { readSessionToken } from '../_server/sessionCookie';

export async function generateMetadata(): Promise<Metadata> {
  return { title: getDictionary(await getRequestLocale()).meta.generatorTitle };
}

export default async function GeneratorPage() {
  const { getCurrentUser, getGeneratorStatus } = await getContainer();
  const [currentUser, status] = await Promise.all([
    getCurrentUser.execute(await readSessionToken()),
    // Rendered server-side so an exhausted scope shows a disabled button from the first paint.
    getGeneratorStatus.execute(),
  ]);
  return (
    <PageShell locale={await getRequestLocale()} currentUser={currentUser}>
      <GeneratorPanel status={status} />
    </PageShell>
  );
}
