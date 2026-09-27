import { Card as PrimitiveCard } from '@thijulio/primitives';
import type { CardProps as PrimitiveCardProps } from '@thijulio/primitives';
import '@thijulio/primitives/styles.css';

/** Existing Exodus API, backed by the shared Card implementation. */
export type CardProps = PrimitiveCardProps;

export function Card(props: CardProps) {
  return <PrimitiveCard {...props} />;
}
