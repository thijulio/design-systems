import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '@thijulio/exodus-react';

const meta: Meta<typeof Avatar> = {
  title: 'Exodus/Identity/Avatar',
  component: Avatar,
  args: { initials: 'TV', size: 40 },
  argTypes: {
    variant: { control: 'inline-radio', options: ['accent', 'soft'] },
    shape: { control: 'inline-radio', options: ['circle', 'rounded'] },
    tone: {
      control: 'select',
      options: [
        undefined,
        'neutral',
        'green',
        'blue',
        'teal',
        'amber',
        'violet',
      ],
    },
    size: { control: { type: 'range', min: 24, max: 72, step: 4 } },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Accent: Story = {};
export const Soft: Story = { args: { variant: 'soft' } };
export const Rounded: Story = { args: { shape: 'rounded' } };
export const TonedTeal: Story = { args: { tone: 'teal' } };
