import type { ReactNode } from 'react';
import { AlertCircleIcon, InfoCircleIcon } from './icons';
import styles from './Alert.module.css';

interface AlertProps {
  severity: 'error' | 'info';
  children: ReactNode;
}

/** Errors interrupt screen readers (role=alert); info waits its turn (role=status). */
export function Alert({ severity, children }: AlertProps) {
  const Icon = severity === 'error' ? AlertCircleIcon : InfoCircleIcon;
  return (
    <div className={styles.alert} data-severity={severity} role={severity === 'error' ? 'alert' : 'status'}>
      <Icon className={styles.icon} />
      <p className={styles.message}>{children}</p>
    </div>
  );
}
