import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { composeRefs } from '../_util/refs';
import { cx } from '../_util/style';
import { useThemeScope } from '../ThemeScope/ThemeScope';
import styles from './ToastViewport.module.css';

export interface ToastViewportProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible name of the region. Required: there is no default copy. */
  label: string;
  /**
   * The toasts. Give them no live role (`announce={false}`): this is the
   * live region.
   */
  children?: ReactNode;
  /**
   * Called when a pointer enters a toast or focus moves into the strip, so
   * the caller can stop its auto-dismiss timers (WCAG 2.2.1).
   */
  onPause?: () => void;
  /** Called when the strip is neither hovered nor focused any more. */
  onResume?: () => void;
  /** Theme of the strip. Unset, it takes the enclosing `ThemeScope`'s. */
  'data-theme'?: string;
  /** Colour mode. Unset, it takes the enclosing `ThemeScope`'s. */
  'data-mode'?: string;
}

/** Whether the node is still under the pointer; unknown counts as yes. */
function isHovered(node: HTMLElement): boolean {
  try {
    return node.matches(':hover');
  } catch {
    return true;
  }
}

/**
 * ToastViewport — the fixed strip toasts stack in, at the bottom of the
 * screen (centred, then at the inline end from `sm`). Clicks pass through
 * the empty strip; each child is capped at 24rem and stays clickable.
 *
 * Keep it mounted with no toasts: it is a polite live region
 * (`role="status"`), and a region inserted along with its first message is
 * not announced. Its children must not be live regions themselves, or each
 * toast is read twice. `role` and `aria-live` can still be overridden.
 *
 * While a toast is hovered or anything inside has focus, the strip is
 * paused: it calls `onPause` once, then `onResume` once both have left, so
 * timed toasts can wait for the reader (WCAG 2.2.1). It holds no timers.
 *
 * It carries the enclosing `ThemeScope`'s `data-theme` and `data-mode`
 * (unless given its own), so the strip keeps the scope's theme when it is
 * portalled out of the scope's element, e.g. to `document.body`.
 */
export const ToastViewport = forwardRef<HTMLDivElement, ToastViewportProps>(
  function ToastViewport(
    {
      label,
      className,
      onPause,
      onResume,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      'data-theme': ownTheme,
      'data-mode': ownMode,
      ...props
    },
    ref,
  ) {
    const scope = useThemeScope();
    const nodeRef = useRef<HTMLDivElement>(null);
    const setRefs = useMemo(() => composeRefs(nodeRef, ref), [ref]);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const paused = hovered || focused;

    // The latest callbacks, so a new function identity is not a transition.
    const handlers = useRef({ onPause, onResume });
    handlers.current = { onPause, onResume };
    const wasPaused = useRef(false);
    useEffect(() => {
      if (paused === wasPaused.current) return;
      wasPaused.current = paused;
      if (paused) handlers.current.onPause?.();
      else handlers.current.onResume?.();
    }, [paused]);

    // A dismissed toast leaves without a pointerleave or blur: when the
    // count drops, re-read where focus and the pointer are.
    const childCount = useRef(0);
    useEffect(() => {
      const node = nodeRef.current;
      if (!node) return;
      const count = node.childElementCount;
      const dropped = count < childCount.current;
      childCount.current = count;
      if (!dropped) return;
      if (!node.contains(node.ownerDocument.activeElement)) setFocused(false);
      if (!isHovered(node)) setHovered(false);
    });

    return (
      <div
        role="status"
        aria-live="polite"
        data-theme={ownTheme ?? scope.theme}
        data-mode={ownMode ?? scope.mode}
        {...props}
        ref={setRefs}
        aria-label={label}
        className={cx(styles.viewport, className)}
        onPointerEnter={(event: PointerEvent<HTMLDivElement>) => {
          onPointerEnter?.(event);
          setHovered(true);
        }}
        onPointerLeave={(event: PointerEvent<HTMLDivElement>) => {
          onPointerLeave?.(event);
          setHovered(false);
        }}
        onFocus={(event: FocusEvent<HTMLDivElement>) => {
          onFocus?.(event);
          setFocused(true);
        }}
        onBlur={(event: FocusEvent<HTMLDivElement>) => {
          onBlur?.(event);
          const next = event.relatedTarget;
          if (!(next instanceof Node && event.currentTarget.contains(next))) {
            setFocused(false);
          }
        }}
      />
    );
  },
);

ToastViewport.displayName = 'ToastViewport';
