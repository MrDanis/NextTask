import type { Metadata } from 'next';
import { getContainer } from '@/infrastructure/container';
import { PageShell } from '@/presentation/components/layout/PageShell';
import { SignInForm } from '@/presentation/components/sign-in/SignInForm';
import { getDictionary } from '@/presentation/i18n/dictionaries';
import { getRequestLocale } from '../_server/locale';
import { readSessionToken } from '../_server/sessionCookie';

export async function generateMetadata(): Promise<Metadata> {
  return { title: getDictionary(await getRequestLocale()).meta.signInTitle };
}

export default async function SignInPage() {
  const { getCurrentUser } = await getContainer();
  const currentUser = await getCurrentUser.execute(await readSessionToken());
  return (
    <PageShell locale={await getRequestLocale()} currentUser={currentUser}>
      <SignInForm />
    </PageShell>
  );
}
