import Link from 'next/link';
import type { Dictionary } from '../../i18n/dictionaries';
import { Card, CardTitle } from '../ui/Card';
import { ChevronLeftIcon } from '../ui/icons';
import styles from './NotFoundCard.module.css';

export function NotFoundCard({ copy }: { copy: Dictionary['notFound'] }) {
  return (
    <Card className={styles.card} aria-labelledby="not-found-title">
      <CardTitle id="not-found-title">{copy.title}</CardTitle>
      <p className={styles.body}>{copy.body}</p>
      <Link href="/sign-in" className={styles.back}>
        <ChevronLeftIcon />
        {copy.back}
      </Link>
    </Card>
  );
}
