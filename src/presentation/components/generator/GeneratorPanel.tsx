'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { GeneratorStatusDto } from '@/application/generator/dto';
import { drawsClient } from '../../api/clients';
import { useNumberGenerator } from '../../hooks/useNumberGenerator';
import { useI18n } from '../../i18n/I18nProvider';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Card, CardTitle } from '../ui/Card';
import { CheckIcon, ChevronLeftIcon, CopyIcon } from '../ui/icons';
import { copyText } from '../../lib/copyText';
import { NumberSlots } from './NumberSlots';
import styles from './GeneratorPanel.module.css';

const ENTRY_ERROR_ID = 'generator-entry-error';

export function GeneratorPanel({ status }: { status: GeneratorStatusDto }) {
  const { t } = useI18n();
  const slotRefs = useRef<(HTMLInputElement | null)[]>([]);
  const generator = useNumberGenerator({
    scope: status,
    initiallyExhausted: status.remaining <= 0,
    createDraw: drawsClient.create,
    claimDraw: drawsClient.claim,
  });

  // Which code was last copied (and whether it worked); reset when a different code is on screen.
  const [copied, setCopied] = useState<{ code: string; ok: boolean } | null>(null);
  const code = generator.copyableCode;
  const copyState = copied && copied.code === code ? copied : null;
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(false), 2000);
    return () => clearTimeout(timer);
  }, [flash]);

  async function copyCode(value: string) {
    const ok = await copyText(value);
    setCopied({ code: value, ok });
    setFlash(ok);
  }

  const copy = t.generator;
  const { error } = generator;
  const { rejected, entryError } = generator;
  const entryMessage = rejected
    ? copy.entryErrors.repeated({ value: rejected.value, position: rejected.slot + 1 })
    : entryError && entryError !== 'repeated'
      ? copy.entryErrors[entryError](status)
      : null;
  const errorMessage = !error ? null : error === 'network' || error === 'internal' ? t.common[error] : copy.errors[error];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const outcome = await generator.submit();
    if ('focusSlot' in outcome) slotRefs.current[outcome.focusSlot]?.focus();
    // Every issued number is copied straight away, ready to paste as the sign-in password.
    // Still inside the click's user activation, which browsers require for clipboard writes;
    // where that has lapsed (e.g. a slow network in Safari) the message shows the number instead.
    else if (outcome.issued?.code) await copyCode(outcome.issued.code);
  }

  return (
    <Card aria-labelledby="generator-title" className={styles.panel}>
      <div className={styles.heading}>
        <CardTitle id="generator-title">{copy.title}</CardTitle>
        <p className={styles.description}>{copy.description(status)}</p>
      </div>

      <form className={styles.body} noValidate onSubmit={handleSubmit}>
        <NumberSlots
          values={generator.slots}
          maxLength={String(status.max).length}
          invalidSlots={generator.invalidSlots}
          drawKey={generator.drawKey}
          disabled={generator.exhausted || generator.loading}
          label={copy.resultLabel}
          slotLabel={copy.slotLabel}
          describedBy={ENTRY_ERROR_ID}
          inputRefs={slotRefs}
          onChange={generator.setSlot}
          onFill={generator.fillFrom}
        />

        {entryMessage && (
          <p id={ENTRY_ERROR_ID} className={styles.entryError} role="alert">
            {entryMessage}
          </p>
        )}

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {code && copyState && (
          <Alert severity={copyState.ok ? 'info' : 'error'}>
            {copyState.ok ? copy.copiedHint(code) : copy.copyFailed(code)}
          </Alert>
        )}

        <Button
          type="submit"
          loading={generator.loading}
          loadingLabel={generator.manual ? copy.submittingOwn : copy.submitting}
          disabled={generator.exhausted}
        >
          {generator.manual ? copy.submitOwn : copy.submit}
        </Button>

        <div className={styles.links}>
          <Link href="/sign-in" className={styles.back}>
            <ChevronLeftIcon />
            {copy.back}
          </Link>
          {code && (
            <button type="button" className={styles.back} onClick={() => copyCode(code)} aria-label={copy.copyLabel(code)}>
              {flash ? <CheckIcon /> : <CopyIcon />}
              {flash ? copy.copied : copy.copy}
            </button>
          )}
        </div>
      </form>

      {/* Announces only fresh draws, not the result restored on load. */}
      <p className="visually-hidden" aria-live="polite">
        {generator.drawKey && generator.numbers ? copy.announce(generator.numbers) : ''}
      </p>
    </Card>
  );
}
