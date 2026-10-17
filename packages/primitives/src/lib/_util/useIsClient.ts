import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;

/**
 * `false` on the server and during hydration, `true` afterwards. Unlike a
 * mounted-state effect it is already `true` on a client-only first render, so
 * a portal opened at mount needs no second pass.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
