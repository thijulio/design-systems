import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Inline, Skeleton, Stack } from '@thijulio/primitives';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: { width: 240 },
  argTypes: {
    width: {
      control: 'text',
      description: 'CSS length, or px when a number. Defaults to full width.',
    },
    height: {
      control: 'text',
      description: 'CSS length, or px when a number. Defaults to one line.',
    },
    radius: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'full'],
      description: 'Corner radius (default md).',
    },
    label: {
      control: 'text',
      description:
        'Announced loading text; without it the block is decorative.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

// Decorative: hidden from assistive technology.
export const Default: Story = {};

// One announced status for the whole placeholder; the blocks stay silent.
export const CardPlaceholder: Story = {
  render: () => (
    <Inline gap={3} align="start">
      <Skeleton width={48} height={48} radius="full" label="Loading profile" />
      <Stack gap={2} style={{ width: 240 }}>
        <Skeleton width="60%" />
        <Skeleton />
        <Skeleton width="80%" />
      </Stack>
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole('status');
    await expect(status).toHaveTextContent('Loading profile');
    await expect(canvas.getAllByRole('status')).toHaveLength(1);
  },
};

export const Block: Story = {
  args: { width: 320, height: 180, radius: 'lg' },
};
