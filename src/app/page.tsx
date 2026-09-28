import { redirect } from 'next/navigation';

/** The design's entry artboard is Sign in. */
export default function Home() {
  redirect('/sign-in');
}
