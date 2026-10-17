import {
  cloneElement,
  forwardRef,
  isValidElement,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { mergeSlotProps, useSlotRef } from '../_util/slot';
import { cx } from '../_util/style';
import styles from './Button.module.css';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'soft'
  | 'ghost'
  | 'danger'
  | 'danger-outline'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg';

/** The element a Button ref can point at: the native button or the anchor. */
export type ButtonElement = HTMLButtonElement | HTMLAnchorElement;

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick'
> {
  /** Intent. primary = brand fill, accent = accent fill; the rest as named. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * In flight: renders a spinner, sets `aria-busy` + `aria-disabled` and
   * refuses the press. Never sets native `disabled`, which would blur the
   * control and drop a keyboard user's focus.
   */
  isLoading?: boolean;
  /** Visually hidden text announced with the spinner while loading. */
  loadingLabel?: string;
  /**
   * Render the single child element (e.g. a router link) with the Button's
   * classes and state attributes instead of a `<button>`.
   */
  asChild?: boolean;
  /** Stretch to the container width. */
  fullWidth?: boolean;
  /** Render a link when supplied; disabled links remain disabled buttons. */
  href?: string;
  target?: AnchorProps['target'];
  rel?: AnchorProps['rel'];
  download?: AnchorProps['download'];
  onClick?: MouseEventHandler<ButtonElement>;
  children?: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: styles.primary,
  accent: styles.accent,
  secondary: styles.secondary,
  soft: styles.soft,
  ghost: styles.ghost,
  danger: styles.danger,
  'danger-outline': styles.dangerOutline,
  link: styles.link,
};

/** Attributes that only mean something on a `<button>`; dropped on anchors. */
const BUTTON_ONLY = [
  'form',
  'formAction',
  'formEncType',
  'formMethod',
  'formNoValidate',
  'formTarget',
  'name',
  'value',
] as const;

function stripButtonOnly<T extends object>(
  props: T,
): Omit<T, (typeof BUTTON_ONLY)[number]> {
  const rest = { ...props } as Record<string, unknown>;
  for (const key of BUTTON_ONLY) delete rest[key];
  return rest as Omit<T, (typeof BUTTON_ONLY)[number]>;
}

const refusePress = (event: MouseEvent) => event.preventDefault();

/**
 * Button — brand-agnostic action control. Every colour resolves through the
 * shared `--ds-*` contract, so each brand skins it by supplying those aliases.
 */
export const Button = forwardRef<ButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading,
    loadingLabel,
    asChild = false,
    fullWidth = false,
    href,
    target,
    rel,
    download,
    disabled = false,
    type = 'button',
    className,
    children,
    onClick,
    'aria-busy': ariaBusy,
    'aria-disabled': ariaDisabled,
    ...props
  },
  ref,
) {
  const loading = Boolean(isLoading);
  const unavailable = disabled || loading;
  const slotRef = useSlotRef<unknown>(
    ref as Ref<unknown>,
    asChild ? children : undefined,
  );
  const classes = cx(
    styles.btn,
    styles[size],
    VARIANT_CLASS[variant],
    fullWidth && styles.fullWidth,
    className,
  );
  // A caller's own busy/unavailable announcement survives unless loading
  // takes over (`isLoading={false}` explicitly announces "not busy").
  const stateAttrs = {
    'aria-busy': isLoading ?? ariaBusy,
    'aria-disabled': loading ? true : ariaDisabled,
  };

  if (asChild && isValidElement(children)) {
    type ChildProps = {
      className?: string;
      tabIndex?: number;
      onClick?: MouseEventHandler<Element>;
    };
    const child = children as ReactElement<ChildProps>;
    const childProps = child.props;
    // The child's own props win (undefined never overrides), so its own
    // `aria-*`, `style` and `tabIndex` survive; only an unavailable state is
    // forced, because it must block the press.
    const merged = mergeSlotProps(
      {
        ...stripButtonOnly(props),
        ...stateAttrs,
        'aria-disabled': unavailable ? true : ariaDisabled,
        className: classes,
      },
      childProps,
    );
    const overrides = {
      ...merged,
      ...(loading ? { 'aria-busy': true } : null),
      ...(unavailable ? { 'aria-disabled': true, tabIndex: -1 } : null),
      onClick: (event: MouseEvent<ButtonElement>) => {
        // A router link checks defaultPrevented, so this also stops navigation.
        if (unavailable) {
          event.preventDefault();
          return;
        }
        childProps.onClick?.(event);
        onClick?.(event);
      },
      ref: slotRef,
    };
    return cloneElement(child, overrides as Partial<ChildProps>);
  }

  const content = (
    <>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
      {loading && loadingLabel && (
        <span className={styles.visuallyHidden}>{loadingLabel}</span>
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <a
        {...(stripButtonOnly(props) as unknown as AnchorProps)}
        {...stateAttrs}
        ref={ref as Ref<HTMLAnchorElement>}
        // Kept while loading so the link stays focusable; the press is
        // refused and `aria-disabled` announces it.
        href={href}
        target={target}
        rel={rel}
        download={download}
        onClick={loading ? refusePress : onClick}
        className={classes}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...props}
      {...stateAttrs}
      ref={ref as Ref<HTMLButtonElement>}
      type={type}
      // Busy is never native `disabled`; the press is refused in onClick.
      disabled={disabled && !loading}
      onClick={loading ? refusePress : onClick}
      className={classes}
    >
      {content}
    </button>
  );
});

Button.displayName = 'Button';
