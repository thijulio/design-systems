import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { Button, type ButtonSize, type ButtonVariant } from '../Button/Button';
import { LiveRegion } from '../LiveRegion/LiveRegion';
import { cx } from '../_util/style';
import styles from './LoadMore.module.css';

export type LoadMoreAlign = 'start' | 'center' | 'end';

export interface LoadMoreProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  /** How many items are on screen now. */
  shown: number;
  /** How many items the whole list holds. */
  total: number;
  /**
   * Formats the live status from `shown` and `total`, e.g.
   * `(shown, total) => \`Showing ${shown} of ${total}\``. There is no
   * default copy.
   */
  status: (shown: number, total: number) => ReactNode;
  /** Visible button label. There is no default copy. */
  label: ReactNode;
  /** Asks for the next page. */
  onLoadMore: () => void;
  /** More items exist past the ones shown. */
  hasMore: boolean;
  /**
   * A page is in flight. The button stays mounted, so focus stays on it,
   * shows a spinner, sets `aria-busy` and refuses the press.
   */
  loading?: boolean;
  /**
   * The last page request failed. The button stays mounted with
   * `aria-disabled` and refuses the press, so focus stays put while a retry
   * elsewhere recovers. Unset leaves `aria-disabled` off.
   */
  failed?: boolean;
  /** Visually hidden text announced with the spinner while loading. */
  loadingLabel?: string;
  /** Button intent. Default `secondary`. */
  buttonVariant?: ButtonVariant;
  /** Button size. Default `md`. */
  buttonSize?: ButtonSize;
  /** `data-testid` for the button. */
  buttonTestId?: string;
  /** Extra class on the button, e.g. a brand's Button skin. */
  buttonClassName?: string;
  /** `data-testid` for the live status. */
  statusTestId?: string;
  /** Element for the live status. Default `p`. */
  statusAs?: ElementType;
  /** Where the button sits on the row. Default `center`. */
  align?: LoadMoreAlign;
  /** Element to render; defaults to `div`. */
  as?: ElementType;
}

const ALIGN_CLASS: Record<LoadMoreAlign, string> = {
  start: styles.start,
  center: styles.center,
  end: styles.end,
};

/**
 * LoadMore — a "load more" button with a live "x of y" status. The status is
 * a visually hidden LiveRegion that stays mounted, so each page that lands is
 * announced. The button renders while there is more, while a page is in
 * flight and after a failed page, so a press never unmounts it under the
 * reader's focus. Every string is supplied by the caller.
 */
export const LoadMore = forwardRef<HTMLElement, LoadMoreProps>(
  function LoadMore(
    {
      shown,
      total,
      status,
      label,
      onLoadMore,
      hasMore,
      loading,
      failed,
      loadingLabel,
      buttonVariant = 'secondary',
      buttonSize = 'md',
      buttonTestId,
      buttonClassName,
      statusTestId,
      statusAs = 'p',
      align = 'center',
      as: Component = 'div',
      className,
      ...props
    },
    ref,
  ) {
    const showButton = hasMore || Boolean(loading) || Boolean(failed);
    return (
      <Component
        ref={ref}
        {...props}
        className={cx(
          styles.root,
          showButton ? ALIGN_CLASS[align] : styles.idle,
          className,
        )}
      >
        <LiveRegion as={statusAs} data-testid={statusTestId}>
          {status(shown, total)}
        </LiveRegion>
        {showButton ? (
          <Button
            type="button"
            variant={buttonVariant}
            size={buttonSize}
            isLoading={loading}
            loadingLabel={loadingLabel}
            // Never native `disabled`: that would blur the button and drop
            // the reader's focus, the loss this component exists to avoid.
            aria-disabled={failed}
            onClick={failed ? undefined : onLoadMore}
            data-testid={buttonTestId}
            className={buttonClassName}
          >
            {label}
          </Button>
        ) : null}
      </Component>
    );
  },
);

LoadMore.displayName = 'LoadMore';
