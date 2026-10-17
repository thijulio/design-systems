import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Link, Stack, Text } from '@thijulio/primitives';

const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  args: { href: '#privacy', children: 'Read the privacy policy' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['accent', 'inherit', 'muted'],
      description: 'Colour (default accent).',
    },
    underline: {
      control: 'inline-radio',
      options: ['always', 'hover', 'none'],
      description: 'When the underline shows (default always).',
    },
    external: {
      description: 'Opens in a new tab with a safe `rel` and a trailing icon.',
    },
    externalLabel: {
      control: 'text',
      description:
        'Visually hidden suffix for external links, e.g. "(opens in a new tab)".',
    },
    asChild: {
      control: false,
      description: 'Style the single child element (a router link) instead.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Link>;

export const Default: Story = {};

// The visually hidden suffix joins the accessible name.
export const External: Story = {
  args: {
    href: 'https://example.com',
    external: true,
    externalLabel: '(opens in a new tab)',
    children: 'Help centre',
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toHaveAccessibleName(
      'Help centre (opens in a new tab)',
    );
  },
};

// Inside running text the link keeps its underline so it is not told apart
// by colour alone.
export const InText: Story = {
  render: (args) => (
    <Text>
      By continuing you agree to our <Link {...args}>terms of service</Link>{' '}
      and acknowledge our privacy notice.
    </Text>
  ),
  args: { href: '#terms' },
};

export const Tones: Story = {
  render: () => (
    <Stack gap={2}>
      <Link href="#accent">Accent link</Link>
      <Text tone="secondary">
        <Link href="#inherit" tone="inherit">
          Inherits the surrounding colour
        </Link>
      </Text>
      <Link href="#muted" tone="muted">
        Muted link
      </Link>
    </Stack>
  ),
};

// `asChild` styles a router link; a plain anchor stands in for one here.
export const AsChild: Story = {
  render: () => (
    <Link asChild>
      <a href="#dashboard">Back to dashboard</a>
    </Link>
  ),
};
