import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../_util/style';
import { composeRefs } from '../_util/refs';
import { tabbableWithin, wrapTarget } from '../_util/focus';
import { useIsClient } from '../_util/useIsClient';
import {
  ThemeScopeContext,
  useNestedThemeScope,
  useThemeScope,
} from '../ThemeScope/ThemeScope';
import { Icon } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import styles from './Dialog.module.css';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DialogProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'role' | 'children'
> {
  open: boolean;
  /** Called by the close control and on Escape (unless a control inside called `preventDefault()`). */
  onClose: () => void;
  /** Visible title; it names the dialog (`aria-labelledby`). */
  title: ReactNode;
  /** Optional line under the title; it describes the dialog (`aria-describedby`). */
  description?: ReactNode;
  children?: ReactNode;
  /** Actions row (e.g. Cancel / Submit). */
  footer?: ReactNode;
  size?: DialogSize;
  /** Accessible name of the always-present close control. Required: no default copy. */
  closeLabel: string;
  /** Element to focus on open; defaults to the first tabbable control (the close button). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  role?: 'dialog' | 'alertdialog';
  'data-testid'?: string;
  /**
   * Theme of the dialog. Unset, it takes the enclosing `ThemeScope`'s, else
   * the one around the element that opened it.
   */
  'data-theme'?: string;
  /** Colour mode. Unset, it takes the enclosing `ThemeScope`'s. */
  'data-mode'?: string;
}

const SIZE_CLASS: Record<DialogSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
};

/**
 * Moves focus into the dialog on open, keeps Tab inside it, closes on Escape,
 * locks page scroll, takes the opener's `data-theme` when neither the caller
 * nor a `ThemeScope` set one, and hands focus back to the opener on close. Listens on
 * the document so Tab and Escape still work after focus has fallen to the
 * body. `onClose` is read through a ref because consumers pass it inline:
 * keying the effect on it would re-run on every parent render and pull focus
 * back to the first control. Children must not use `autoFocus`: the opener is
 * read after commit, so an autofocused child would be taken for it.
 */
/**
 * Open dialogs, oldest first. Every open dialog listens on the document, so
 * only the top one answers Escape and Tab: a dialog opened from another one
 * closes first and keeps focus inside itself.
 */
const openDialogs: HTMLElement[] = [];

function useDialogBehaviour(
  active: boolean,
  dialogRef: RefObject<HTMLDivElement | null>,
  onClose: () => void,
  initialFocusRef: RefObject<HTMLElement | null> | undefined,
  hasOwnTheme: boolean,
): string | null {
  const [inheritedTheme, setInheritedTheme] = useState<string | null>(null);
  const hasOwnThemeRef = useRef(hasOwnTheme);
  hasOwnThemeRef.current = hasOwnTheme;
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!active || !dialog) return;
    const doc = dialog.ownerDocument;
    const opener =
      doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
    // The portal leaves the themed subtree the dialog was opened from, so it
    // takes the opener's theme unless the caller or a `ThemeScope` set one.
    // It goes through state, never onto the React-owned node. Without a
    // focused opener there is nothing to read: render the dialog inside a
    // `ThemeScope`, or pass `data-theme`, in that case.
    if (!hasOwnThemeRef.current) {
      setInheritedTheme(
        opener?.closest('[data-theme]')?.getAttribute('data-theme') ?? null,
      );
    }
    (initialFocusRef?.current ?? tabbableWithin(dialog)[0])?.focus();

    const { body } = doc;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    openDialogs.push(dialog);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (openDialogs[openDialogs.length - 1] !== dialog) return;
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const target = wrapTarget(dialog, event.shiftKey);
      if (target) {
        event.preventDefault();
        target.focus();
      }
    };
    doc.addEventListener('keydown', handleKeyDown);
    return () => {
      doc.removeEventListener('keydown', handleKeyDown);
      openDialogs.splice(openDialogs.indexOf(dialog), 1);
      body.style.overflow = previousOverflow;
      setInheritedTheme(null);
      opener?.focus();
    };
    // initialFocusRef is a ref object, read once at open time.
  }, [active, dialogRef]);

  return inheritedTheme;
}

/**
 * Dialog — modal window portalled to `document.body`. Renders nothing on the
 * server (and during hydration); the close control is always rendered. Rest
 * props land on the dialog element. The portal would lose the page's theme,
 * so the dialog's `data-theme` is, in order: its own, the enclosing
 * `ThemeScope`'s, else the one around the element that opened it.
 * `data-mode` is its own or the scope's. Its content sees that theme as its
 * scope, so a dialog opened from it keeps it.
 */
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  {
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    closeLabel,
    initialFocusRef,
    role = 'dialog',
    className,
    'data-theme': ownTheme,
    'data-mode': ownMode,
    ...props
  },
  ref,
) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const setRefs = useMemo(() => composeRefs(dialogRef, ref), [ref]);
  const isClient = useIsClient();
  const visible = open && isClient;
  const scope = useThemeScope();
  const inheritedTheme = useDialogBehaviour(
    visible,
    dialogRef,
    onClose,
    initialFocusRef,
    ownTheme !== undefined || scope.theme !== undefined,
  );
  const theme = ownTheme ?? scope.theme ?? inheritedTheme ?? undefined;
  const mode = ownMode ?? scope.mode;
  const contentScope = useNestedThemeScope(theme, mode);

  if (!visible || typeof document === 'undefined') return null;

  const hasDescription =
    description !== undefined && description !== null && description !== '';

  return createPortal(
    <ThemeScopeContext.Provider value={contentScope}>
      <div className={styles.overlay}>
        <div
          ref={setRefs}
          role={role}
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={hasDescription ? descriptionId : undefined}
          data-theme={theme}
          data-mode={mode}
          {...props}
          className={cx(styles.dialog, SIZE_CLASS[size], className)}
        >
          <div className={styles.header}>
            <div className={styles.heading}>
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
              {hasDescription && (
                <p id={descriptionId} className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            <IconButton
              label={closeLabel}
              icon={<Icon name="close" size={18} />}
              size="sm"
              variant="ghost"
              onClick={onClose}
            />
          </div>
          <div className={styles.body}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>
    </ThemeScopeContext.Provider>,
    document.body,
  );
});
Dialog.displayName = 'Dialog';
