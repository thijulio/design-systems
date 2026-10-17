import type { ReactNode } from 'react';

/** id of the hint a field renders for the control `id`; use in `aria-describedby`. */
export function fieldHintId(id: string): string {
  return `${id}-hint`;
}

/** id of the error a field renders for the control `id`; use in `aria-describedby`. */
export function fieldErrorId(id: string): string {
  return `${id}-error`;
}

/**
 * `aria-describedby` for a field's control: the error id while an error
 * shows, else the hint id, else nothing. One target at a time, because the
 * error replaces the hint on screen.
 */
export function fieldDescribedBy(
  id: string,
  { error, hint }: { error?: ReactNode; hint?: ReactNode } = {},
): string | undefined {
  if (error) return fieldErrorId(id);
  if (hint) return fieldHintId(id);
  return undefined;
}
