import { Card as PrimitiveCard } from '@thijulio/primitives';
import type { CardProps as PrimitiveCardProps } from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';
import { cx } from '../_util/style';
import styles from './Card.module.css';

/** Existing Exodus API, backed by the shared Card implementation. */
export interface CardProps extends PrimitiveCardProps {
  /** Apply the default 18/20 padding. */
  pad?: boolean;
}

export function Card({ className, ...props }: CardProps) {
  return <PrimitiveCard {...props} className={cx(styles.compat, className)} />;
}
