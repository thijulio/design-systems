import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Grid, Icon, Inline, Text, type IconName } from '@thijulio/primitives';

// The registry, in display order (mirrors the primitive's ICON_NAMES).
const NAMES: IconName[] = [
  'close',
  'check',
  'chevron-left',
  'chevron-right',
  'chevron-up',
  'chevron-down',
  'arrow-left',
  'arrow-right',
  'arrow-up',
  'arrow-down',
  'arrow-up-down',
  'bookmark',
  'bookmark-filled',
  'star',
  'share',
  'alert',
  'info',
  'upload',
  'external',
  'search',
  'menu',
  'plus',
  'minus',
  'edit',
  'trash',
  'calendar',
  'mail',
  'phone',
  'map-pin',
  'heart',
  'user',
  'settings',
  'filter',
  'download',
  'eye',
  'eye-off',
];

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  args: { name: 'calendar', size: 20 },
  argTypes: {
    name: {
      control: 'select',
      options: NAMES,
      description: 'Glyph from the shared registry.',
    },
    size: { description: 'Rendered width and height in px (default 20).' },
    label: {
      control: 'text',
      description:
        'Accessible name. Without it the icon is decorative (`aria-hidden`).',
    },
    strokeWidth: { description: 'Stroke width in viewBox units (default 2).' },
  },
};
export default meta;

type Story = StoryObj<typeof Icon>;

// Decorative: hidden from assistive technology.
export const Default: Story = {};

// With a label the icon is an image with an accessible name.
export const Labelled: Story = {
  args: { name: 'alert', label: 'Warning' },
  play: async ({ canvasElement }) => {
    const icon = within(canvasElement).getByRole('img', { name: 'Warning' });
    await expect(icon).not.toHaveAttribute('aria-hidden');
  },
};

// The icon inherits currentColor, so it takes the surrounding text tone.
export const InText: Story = {
  render: () => (
    <Text as="div" tone="success">
      <Inline gap={2}>
        <Icon name="check" size={16} />
        <span>Payment received</span>
      </Inline>
    </Text>
  ),
};

export const Gallery: Story = {
  render: () => (
    <Grid minItemWidth="9rem" gap={3}>
      {NAMES.map((name) => (
        <Inline key={name} gap={2}>
          <Icon name={name} />
          <Text as="span" size="caption" tone="secondary">
            {name}
          </Text>
        </Inline>
      ))}
    </Grid>
  ),
};
