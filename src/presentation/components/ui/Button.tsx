import type { ComponentPropsWithoutRef } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** Shows a spinner and blocks clicks, but keeps the enabled look: the action is running, not unavailable. */
  loading?: boolean;
  loadingLabel?: string;
}

export function Button({ loading = false, loadingLabel, children, className, onClick, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={[styles.button, className].filter(Boolean).join(' ')}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      data-loading={loading || undefined}
      // aria-disabled instead of `disabled` while loading, so focus stays on the button.
      onClick={loading ? (event) => event.preventDefault() : onClick}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
