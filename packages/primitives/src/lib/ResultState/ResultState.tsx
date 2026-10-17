import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import type { AlertTone } from '../Alert/Alert';
import { Heading, type HeadingLevel } from '../Heading/Heading';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
import type { Space } from '../_util/space';
import { cx } from '../_util/style';
import styles from './ResultState.module.css';

/** Colour of the icon tile. Same scale as Alert. */
export type ResultStateTone = AlertTone;
export type ResultStateAnnounce = 'status' | 'alert' | 'off';
export type ResultStateAlign = 'start' | 'center';

export interface ResultStateProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'title'
> {
  /** What happened. Required: there is no default copy. */
  title: ReactNode;
  /** Heading element for the title. Default 1: an outcome is usually the page. */
  headingLevel?: HeadingLevel;
  /** What it means or what to do next, under the title. */
  message?: ReactNode;
  /** Element for the message: `p` (default), or `div` for several blocks. */
  messageAs?: 'p' | 'div';
  /** Icon rendered in a tone-coloured tile above the title (decorative). */
  icon?: ReactNode;
  /** Colour of the icon tile. Default `neutral`. */
  tone?: ResultStateTone;
  /**
   * Role of the title-and-message block, so an outcome that arrives after
   * load is announced: `status` (default), `alert`, or `off` for none. The
   * actions stay outside it, so their labels are not read as the outcome.
   */
  announce?: ResultStateAnnounce;
  /** `data-testid` for the announced title-and-message block. */
  outcomeTestId?: string;
  /** Extra content between the message and the actions (e.g. a record). */
  children?: ReactNode;
  /** The way forward: buttons, links or a hint, laid out in a row. */
  actions?: ReactNode;
  /** Cross-axis alignment of the content. Default `start`. */
  align?: ResultStateAlign;
  /** Space between the outcome, the extra content and the actions. Default 8. */
  gap?: Space;
}

const TONE_CLASS: Record<ResultStateTone, string> = {
  neutral: styles.neutral,
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
};

const ROLE: Record<ResultStateAnnounce, string | undefined> = {
  status: 'status',
  alert: 'alert',
  off: undefined,
};

/**
 * ResultState — the outcome of an action or a link: an optional icon tile, a
 * title and message announced as one block, extra content and the actions.
 * Every string is supplied by the caller.
 */
export const ResultState = forwardRef<HTMLElement, ResultStateProps>(
  function ResultState(
    {
      title,
      headingLevel = 1,
      message,
      messageAs = 'p',
      icon,
      tone = 'neutral',
      announce = 'status',
      outcomeTestId,
      children,
      actions,
      align = 'start',
      gap = 8,
      className,
      ...props
    },
    ref,
  ) {
    const center = align === 'center';
    return (
      <Stack
        ref={ref}
        {...props}
        gap={gap}
        align={center ? 'center' : 'stretch'}
        className={cx(styles.root, center && styles.center, className)}
      >
        {icon && (
          <span
            className={cx(styles.icon, TONE_CLASS[tone])}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <Stack gap={4} role={ROLE[announce]} data-testid={outcomeTestId}>
          <Heading level={headingLevel} weight="semibold">
            {title}
          </Heading>
          {message ? (
            <Text as={messageAs} tone="secondary">
              {message}
            </Text>
          ) : null}
        </Stack>
        {children}
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </Stack>
    );
  },
);

ResultState.displayName = 'ResultState';
