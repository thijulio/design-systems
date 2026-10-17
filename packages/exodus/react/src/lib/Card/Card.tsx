import { forwardRef } from 'react';
import { Card as PrimitiveCard } from '@thijulio/primitives';
import type {
  CardElement,
  CardHeadingLevel,
  CardPadding,
  CardPaddingSpace,
  CardProps as PrimitiveCardProps,
  CardSurface,
  CardTone,
} from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';
import { cx } from '../_util/style';
import styles from './Card.module.css';

export type {
  CardElement,
  CardHeadingLevel,
  CardPadding,
  CardPaddingSpace,
  CardSurface,
  CardTone,
};

/** Existing Exodus API, backed by the shared Card implementation. */
export interface CardProps extends PrimitiveCardProps {
  /** Apply the default 18/20 padding. */
  pad?: boolean;
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <PrimitiveCard
      {...props}
      ref={ref}
      className={cx(styles.compat, className)}
    />
  );
});

Card.displayName = 'Card';
