'use client';

import type { ClipboardEvent, CSSProperties, KeyboardEvent, RefObject } from 'react';
import styles from './NumberSlots.module.css';

interface NumberSlotsProps {
  values: readonly string[];
  /** Characters per box: digits in the scope's largest number (1 for 0–9). */
  maxLength: number;
  invalidSlots: readonly number[];
  /** New key → slots remount → reveal animation replays. */
  drawKey: string | null;
  disabled: boolean;
  label: string;
  slotLabel: (position: number, total: number) => string;
  describedBy?: string;
  inputRefs: RefObject<(HTMLInputElement | null)[]>;
  /** Returns false when the value was refused (already in another box). */
  onChange: (index: number, value: string) => boolean;
  onFill: (start: number, values: string[]) => boolean;
}

/**
 * The six drawn boxes, editable. Empty boxes show the design's "-" as a
 * placeholder, so the untouched card is pixel-identical to the design.
 */
export function NumberSlots({
  values,
  maxLength,
  invalidSlots,
  drawKey,
  disabled,
  label,
  slotLabel,
  describedBy,
  inputRefs,
  onChange,
  onFill,
}: NumberSlotsProps) {
  const focusSlot = (index: number) => {
    const input = inputRefs.current[index];
    if (!input) return;
    input.focus();
    input.select();
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, '');
    // Typing into a filled box replaces it (the box is selected on focus; slice covers browsers that don't).
    const value = digits.slice(-maxLength);
    // A refused number leaves the box as it was and the cursor where it is.
    if (onChange(index, value) && value.length === maxLength && index < values.length - 1) focusSlot(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && values[index] === '' && index > 0) {
      event.preventDefault();
      onChange(index - 1, '');
      focusSlot(index - 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusSlot(index - 1);
    } else if (event.key === 'ArrowRight' && index < values.length - 1) {
      event.preventDefault();
      focusSlot(index + 1);
    }
  };

  // Pasting "380591" into any box spreads it across the boxes from there.
  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    const digits = event.clipboardData.getData('text').replace(/\D/g, '');
    if (digits.length <= maxLength) return;
    event.preventDefault();
    const chunks = digits.match(new RegExp(`\\d{1,${maxLength}}`, 'g')) ?? [];
    if (onFill(index, chunks)) focusSlot(Math.min(index + chunks.length, values.length - 1));
  };

  return (
    <ol className={styles.slots} aria-label={label}>
      {values.map((value, i) => {
        const invalid = invalidSlots.includes(i);
        return (
          <li
            key={`${drawKey ?? 'slot'}-${i}`}
            className={styles.slot}
            data-invalid={invalid || undefined}
            data-reveal={drawKey && value ? '' : undefined}
            style={{ '--i': i } as CSSProperties}
          >
            <input
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              className={styles.input}
              value={value}
              placeholder="-"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              enterKeyHint={i === values.length - 1 ? 'done' : 'next'}
              aria-label={slotLabel(i + 1, values.length)}
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? describedBy : undefined}
              disabled={disabled}
              onFocus={(e) => e.target.select()}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={(e) => handlePaste(i, e)}
            />
          </li>
        );
      })}
    </ol>
  );
}
