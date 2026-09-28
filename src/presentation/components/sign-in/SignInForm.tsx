'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { sessionClient } from '../../api/clients';
import { useSignInForm } from '../../hooks/useSignInForm';
import { useI18n } from '../../i18n/I18nProvider';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardTitle } from '../ui/Card';
import { PasswordField, TextField } from '../ui/TextField';
import styles from './SignInForm.module.css';

export function SignInForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [showGetStarted, setShowGetStarted] = useState(false);
  const { values, fieldErrors, submitting, formError, emailRef, passwordRef, setEmail, setPassword, handleSubmit } = useSignInForm({
    signIn: sessionClient.signIn,
    onSuccess: () => {
      router.push('/generator');
      router.refresh();
    },
  });

  const copy = t.signIn;
  const formErrorMessage = !formError
    ? null
    : formError === 'network' || formError === 'internal'
      ? t.common[formError]
      : copy.errors[formError];

  return (
    <Card as="form" className={styles.form} noValidate onSubmit={handleSubmit} aria-labelledby="sign-in-title">
      <div className={styles.heading}>
        <CardTitle id="sign-in-title">{copy.title}</CardTitle>
        <p className={styles.subtitle}>
          <span className={styles.muted}>{copy.noAccount}</span>
          {/* There is no registration screen: accounts are created by signing in with a generated number. */}
          <button type="button" className={styles.inlineLink} onClick={() => setShowGetStarted(true)}>
            {copy.getStarted}
          </button>
        </p>
      </div>

      <div className={styles.fields}>
        {formErrorMessage && <Alert severity="error">{formErrorMessage}</Alert>}
        {showGetStarted && !formErrorMessage && <Alert severity="info">{copy.getStartedHint}</Alert>}

        <TextField
          ref={emailRef}
          label={copy.email}
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          value={values.email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email && copy.errors.email[fieldErrors.email]}
        />
        <PasswordField
          ref={passwordRef}
          label={copy.password}
          name="password"
          autoComplete="current-password"
          placeholder={copy.passwordPlaceholder}
          value={values.password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password && copy.errors.password[fieldErrors.password]}
          showLabel={copy.showPassword}
          hideLabel={copy.hidePassword}
        />

        <Link href="/generator" className={styles.generateLink}>
          {copy.generateLink}
        </Link>

        <Button type="submit" loading={submitting} loadingLabel={copy.submitting}>
          {copy.submit}
        </Button>
      </div>
    </Card>
  );
}
