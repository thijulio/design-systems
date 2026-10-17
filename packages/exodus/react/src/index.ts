// Pure re-exports below render shared primitives styled by the Exodus
// `--ds-*` tokens; their stylesheet ships with this entry point.
import '@thijulio/primitives/styles.css';

export { Button } from './lib/Button/Button';
export type { ButtonProps, ButtonVariant } from './lib/Button/Button';

export { Badge } from './lib/Badge/Badge';
export type { BadgeProps, BadgeTone } from './lib/Badge/Badge';

export { StatusBadge, STATE_TONE } from './lib/StatusBadge/StatusBadge';
export type {
  StatusBadgeProps,
  LifecycleState,
  StatusTone,
} from './lib/StatusBadge/StatusBadge';

export { Card } from './lib/Card/Card';
export type {
  CardProps,
  CardElement,
  CardHeadingLevel,
  CardPadding,
  CardPaddingSpace,
  CardSurface,
  CardTone,
} from './lib/Card/Card';

export { EmptyState } from './lib/EmptyState/EmptyState';
export type {
  EmptyStateProps,
  EmptyStateHeadingLevel,
  EmptyStateSize,
  EmptyStateSurface,
  EmptyStateAlign,
} from './lib/EmptyState/EmptyState';

export { ErrorState } from './lib/ErrorState/ErrorState';
export type {
  ErrorStateProps,
  ErrorStateAlign,
  ErrorStateAnnounce,
} from './lib/ErrorState/ErrorState';

export { LoadMore } from './lib/LoadMore/LoadMore';
export type { LoadMoreProps, LoadMoreAlign } from './lib/LoadMore/LoadMore';

export { Tabs, TabPanel, tabId, tabPanelId } from './lib/Tabs/Tabs';
export type {
  TabsProps,
  TabsVariant,
  TabItem,
  TabPanelProps,
} from './lib/Tabs/Tabs';

export { Toast } from './lib/Toast/Toast';
export type { ToastProps, ToastTone } from './lib/Toast/Toast';

export { Avatar } from './lib/Avatar/Avatar';
export type { AvatarProps, AvatarTone } from './lib/Avatar/Avatar';

export { BrandMark } from './lib/BrandMark/BrandMark';
export type { BrandMarkProps } from './lib/BrandMark/BrandMark';

export { NavIcon, ICON_PATHS } from './lib/NavIcon/NavIcon';
export type { NavIconProps, IconName } from './lib/NavIcon/NavIcon';

export {
  Field,
  fieldHintId,
  fieldErrorId,
  fieldDescribedBy,
} from './lib/Field/Field';
export type { FieldProps } from './lib/Field/Field';

export {
  InputField,
  SelectField,
  TextareaField,
} from './lib/InputField/InputField';
export type {
  FieldFrameProps,
  InputFieldProps,
  SelectFieldProps,
  TextareaFieldProps,
} from './lib/InputField/InputField';

export { Input, Textarea } from './lib/Input/Input';
export type { InputProps, TextareaProps } from './lib/Input/Input';

export { Checkbox } from './lib/Checkbox/Checkbox';
export type { CheckboxProps } from './lib/Checkbox/Checkbox';

export { Select } from './lib/Select/Select';
export type { SelectProps } from './lib/Select/Select';

// Shared primitives, re-exported unchanged (no Exodus wrapper needed).
export {
  Alert,
  Carousel,
  Code,
  Container,
  DescriptionList,
  Dialog,
  Disclosure,
  Divider,
  Eyebrow,
  Fieldset,
  FileInput,
  Grid,
  GridItem,
  Heading,
  HoneypotField,
  Icon,
  ICON_NAMES,
  IconButton,
  Inline,
  Link,
  List,
  ListItem,
  LiveRegion,
  MultiSelect,
  NavItem,
  NavList,
  PageHeader,
  Pager,
  ProgressBar,
  RadioGroup,
  Rating,
  ReorderableList,
  ResultState,
  Section,
  SegmentedControl,
  Skeleton,
  SkipLink,
  Spinner,
  Stack,
  Stat,
  Table,
  Tag,
  Text,
  ThemeScope,
  Timeline,
  TimelineItem,
  ToastViewport,
  ToggleButton,
  Tooltip,
  useThemeScope,
  VisuallyHidden,
} from '@thijulio/primitives';
export type {
  AlertLive,
  AlertProps,
  AlertTone,
  ButtonElement,
  ButtonSize,
  CarouselProps,
  CodeProps,
  CodeSize,
  ContainerProps,
  ContainerSize,
  DescriptionListItem,
  DescriptionListProps,
  DialogProps,
  DialogSize,
  DisclosureProps,
  DisclosureVariant,
  DividerProps,
  EyebrowProps,
  FieldsetProps,
  FileInputProps,
  GridAlign,
  GridColumnCount,
  GridItemProps,
  GridProps,
  GridSpan,
  HeadingLevel,
  HeadingProps,
  HoneypotFieldProps,
  IconButtonProps,
  IconButtonSize,
  IconButtonVariant,
  // NavIcon already owns `IconName` here; the generic Icon's glyph names get
  // their own alias.
  IconName as IconGlyphName,
  IconProps,
  InlineAlign,
  InlineJustify,
  InlineProps,
  LinkProps,
  LinkTone,
  LinkUnderline,
  ListColumnCount,
  ListItemAlign,
  ListItemProps,
  ListMarker,
  ListProps,
  LiveRegionPoliteness,
  LiveRegionProps,
  MultiSelectOption,
  MultiSelectProps,
  NavItemProps,
  NavListOrientation,
  NavListProps,
  NavListTone,
  NavListVariant,
  PageHeaderProps,
  PagerProps,
  ProgressBarProps,
  RadioGroupProps,
  RadioGroupVariant,
  RadioOption,
  RatingProps,
  ReorderableListProps,
  ResultStateAlign,
  ResultStateAnnounce,
  ResultStateProps,
  ResultStateTone,
  SectionPadding,
  SectionProps,
  SectionSurface,
  SegmentedControlOption,
  SegmentedControlProps,
  SkeletonProps,
  SkeletonRadius,
  SkipLinkProps,
  Breakpoint,
  Responsive,
  Space,
  SpinnerProps,
  StackAlign,
  StackProps,
  StatLayout,
  StatMarkup,
  StatProps,
  StatTone,
  TableAlign,
  TableColumn,
  TableColumnSort,
  TableProps,
  TableSortDirection,
  TableSortLabels,
  TableSortProps,
  TableSortState,
  TagProps,
  TextAlign,
  TextMeasure,
  TextProps,
  TextSize,
  TextTone,
  TextTracking,
  TextWeight,
  ThemeScopeProps,
  ThemeScopeValue,
  TimelineItemProps,
  TimelineMarker,
  TimelineProps,
  TimelineTone,
  ToastViewportProps,
  ToggleButtonProps,
  ToggleButtonShape,
  TooltipPlacement,
  TooltipProps,
  TooltipRelation,
  VisuallyHiddenProps,
} from '@thijulio/primitives';
