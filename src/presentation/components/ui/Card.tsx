import type { ComponentPropsWithoutRef, ElementType } from 'react';
import styles from './Card.module.css';

type CardProps<T extends ElementType> = { as?: T } & Omit<ComponentPropsWithoutRef<T>, 'as'>;

/** The white elevated surface both screens are built on. Layout inside is the caller's. */
export function Card<T extends ElementType = 'section'>({ as, className, ...rest }: CardProps<T>) {
  const Component: ElementType = as ?? 'section';
  return <Component className={[styles.card, className].filter(Boolean).join(' ')} {...rest} />;
}

export function CardTitle(props: ComponentPropsWithoutRef<'h1'>) {
  return <h1 className={styles.title} {...props} />;
}
