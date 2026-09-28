import 'server-only';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'tj_session';

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}
