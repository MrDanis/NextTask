'use client';

import { useId, useState, type ComponentPropsWithoutRef, type Ref } from 'react';
import { EyeIcon, EyeOffIcon } from './icons';
import styles from './TextField.module.css';

interface FieldProps extends Omit<ComponentPropsWithoutRef<'input'>, 'id'> {
  ref?: Ref<HTMLInputElement>;
  label: string;
  /** Message shown under the field; also marks the input invalid. */
  error?: string;
}

function useFieldIds(error?: string) {
  const id = useId();
  const errorId = `${id}-error`;
  return { id, errorId, describedBy: error ? errorId : undefined };
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className={styles.error}>
      {message}
    </p>
  );
}

/** Filled field with a persistent small label, as drawn for "Email address". */
export function TextField({ ref, label, error, className, ...inputProps }: FieldProps) {
  const { id, errorId, describedBy } = useFieldIds(error);
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')} data-invalid={error ? '' : undefined}>
      <label htmlFor={id} className={styles.box}>
        <span className={styles.label}>{label}</span>
        <input
          ref={ref}
          id={id}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
      </label>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

interface PasswordFieldProps extends Omit<FieldProps, 'type'> {
  showLabel: string;
  hideLabel: string;
}

/**
 * Same field plus a visibility toggle. The toggle sits beside the <label>,
 * not inside it (the design nests it), so clicking it doesn't also focus the input.
 */
export function PasswordField({ ref, label, error, showLabel, hideLabel, className, ...inputProps }: PasswordFieldProps) {
  const { id, errorId, describedBy } = useFieldIds(error);
  const [visible, setVisible] = useState(false);
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')} data-invalid={error ? '' : undefined}>
      <div className={`${styles.box} ${styles.boxWithAction}`}>
        <label htmlFor={id} className={styles.inner}>
          <span className={styles.label}>{label}</span>
          <input
            ref={ref}
            id={id}
            type={visible ? 'text' : 'password'}
            className={styles.input}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            autoCapitalize="none"
            spellCheck={false}
            {...inputProps}
          />
        </label>
        <button
          type="button"
          className={styles.action}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
