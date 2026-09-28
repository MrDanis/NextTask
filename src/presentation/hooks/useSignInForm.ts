'use client';

import { useRef, useState, type FormEvent } from 'react';
import { validateSignIn, type SignInFieldErrors, type SignInInput } from '@/application/auth/validateSignIn';
import type { ApiResult } from '../api/http';

type SignInFormError = 'invalidCredentials' | 'codeNotIssued' | 'codeAlreadyUsed' | 'network' | 'internal';

interface Options {
  signIn: (input: SignInInput) => Promise<ApiResult<unknown>>;
  onSuccess: () => void;
}

/**
 * Validation feedback policy: stay quiet while the user is typing the first
 * time; after the first submit attempt, re-validate on every keystroke so
 * errors disappear as soon as they are fixed.
 */
export function useSignInForm({ signIn, onSuccess }: Options) {
  const [values, setValues] = useState<SignInInput>({ email: '', password: '' });
  const [attempted, setAttempted] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<SignInFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<SignInFormError | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);

  const validation = validateSignIn(values);
  const fieldErrors: SignInFieldErrors = attempted
    ? { ...serverFieldErrors, ...(validation.ok ? {} : validation.errors) }
    : {};

  const setField = (field: keyof SignInInput) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setServerFieldErrors((e) => ({ ...e, [field]: undefined }));
    setFormError(null);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    setAttempted(true);

    if (!validation.ok) {
      (validation.errors.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    setFormError(null);
    const result = await signIn(validation.value);

    if (result.ok) {
      // Stay in the loading state until navigation replaces this screen.
      onSuccess();
      return;
    }

    inFlight.current = false;
    setSubmitting(false);
    if (result.code === 'VALIDATION_FAILED' && result.fields) setServerFieldErrors(result.fields);
    else if (result.code === 'INVALID_CREDENTIALS') setFormError('invalidCredentials');
    else if (result.code === 'CODE_NOT_ISSUED') setFormError('codeNotIssued');
    else if (result.code === 'CODE_ALREADY_USED') setFormError('codeAlreadyUsed');
    else if (result.code === 'NETWORK') setFormError('network');
    else setFormError('internal');
  }

  return {
    values,
    fieldErrors,
    submitting,
    formError,
    emailRef,
    passwordRef,
    setEmail: setField('email'),
    setPassword: setField('password'),
    handleSubmit,
  };
}
