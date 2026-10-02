// Faune is contract-native: every component is the shared primitive, skinned
// purely by the `--ds-*` aliases in @thijulio/faune-css. This package gives
// Faune the same consumer surface as the other brands (`@thijulio/<brand>-react`)
// and is the home for Faune-only components when they appear.
import '@thijulio/primitives/styles.css';

export {
  Avatar,
  Badge,
  Button,
  Card,
  Eyebrow,
  Input,
  Select,
  Tag,
  Textarea,
} from '@thijulio/primitives';
export type {
  AvatarProps,
  AvatarTone,
  BadgeProps,
  BadgeTone,
  ButtonProps,
  ButtonVariant,
  CardProps,
  EyebrowProps,
  InputProps,
  SelectProps,
  TagProps,
  TextareaProps,
} from '@thijulio/primitives';
