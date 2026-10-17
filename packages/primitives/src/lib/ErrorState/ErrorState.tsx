import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Button, type ButtonSize, type ButtonVariant } from '../Button/Button';
import { Heading, type HeadingLevel } from '../Heading/Heading';
import { Stack } from '../Stack/Stack';
import { Text, type TextTone } from '../Text/Text';
import type { Space } from '../_util/space';
import { cx } from '../_util/style';
import styles from './ErrorState.module.css';

export type ErrorStateAlign = 'start' | 'center';
export type ErrorStateAnnounce = 'root' | 'message' | 'off';

export interface ErrorStateProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title' | 'children'
> {
  /** What went wrong. Rendered in a `p` unless `messageAs` says otherwise. */
  message: ReactNode;
  /** Optional heading above the message. */
  title?: ReactNode;
  /** Heading element for the title, to fit the page outline. Default 2. */
  headingLevel?: HeadingLevel;
  /** Element for the message: `p` (default), or `div` for several blocks. */
  messageAs?: 'p' | 'div';
  /** `data-testid` for the message element, to read the message alone. */
  messageTestId?: string;
  /** Colour of the message text. Default `secondary`. */
  tone?: TextTone;
  /** Retry handler. The button renders only with both this and `retryLabel`. */
  onRetry?: () => void;
  /** Visible retry label. There is no default copy. */
  retryLabel?: ReactNode;
  /**
   * A retry is in flight: the button shows a spinner, sets `aria-busy` and
   * refuses the press while keeping focus. Unset leaves `aria-busy` off.
   */
  retrying?: boolean;
  /** Retry button intent. Default `secondary`. */
  retryVariant?: ButtonVariant;
  /** Retry button size. Default `md`. */
  retrySize?: ButtonSize;
  /** `data-testid` for the retry button. */
  retryTestId?: string;
  /** Extra class on the retry button, e.g. a brand's Button skin. */
  retryClassName?: string;
  /**
   * Where `role="alert"` goes. `root` (default) announces the whole panel;
   * `message` only the title and message, so the retry label is not read as
   * part of the alert; `off` sets no role. An explicit `role` on the root
   * always wins.
   */
  announce?: ErrorStateAnnounce;
  /** Cross-axis alignment of the content. Default `start`. */
  align?: ErrorStateAlign;
  /** Space between the message block and the retry button. Default 3. */
  gap?: Space;
}

/**
 * ErrorState — a failure message with an optional title and retry action.
 * Every string is supplied by the caller.
 */
export const ErrorState = forwardRef<HTMLElement, ErrorStateProps>(
  function ErrorState(
    {
      message,
      title,
      headingLevel = 2,
      messageAs = 'p',
      messageTestId,
      tone = 'secondary',
      onRetry,
      retryLabel,
      retrying,
      retryVariant = 'secondary',
      retrySize = 'md',
      retryTestId,
      retryClassName,
      announce = 'root',
      align = 'start',
      gap = 3,
      role,
      className,
      ...props
    },
    ref,
  ) {
    const center = align === 'center';
    const contentRole = announce === 'message' ? 'alert' : undefined;
    const body = (
      <Text
        as={messageAs}
        size="body-sm"
        tone={tone}
        role={title ? undefined : contentRole}
        data-testid={messageTestId}
      >
        {message}
      </Text>
    );
    return (
      <Stack
        ref={ref}
        {...props}
        role={role ?? (announce === 'root' ? 'alert' : undefined)}
        gap={gap}
        align={align}
        className={cx(center && styles.center, className)}
      >
        {title ? (
          <Stack gap={2} align={align} role={contentRole}>
            <Heading
              level={headingLevel}
              size="lead"
              weight="semibold"
              tone="secondary"
            >
              {title}
            </Heading>
            {body}
          </Stack>
        ) : (
          body
        )}
        {onRetry && retryLabel ? (
          <Button
            type="button"
            variant={retryVariant}
            size={retrySize}
            isLoading={retrying}
            onClick={onRetry}
            data-testid={retryTestId}
            className={retryClassName}
          >
            {retryLabel}
          </Button>
        ) : null}
      </Stack>
    );
  },
);

ErrorState.displayName = 'ErrorState';
