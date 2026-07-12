import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '@thijulio/exodus-react';

const meta: Meta<typeof Avatar> = {
  title: 'Exodus/Identity/Avatar',
  component: Avatar,
  args: { initials: 'TV', size: 40 },
  argTypes: {
    initials: {
      description: 'One or two letters shown when there is no image.',
    },
    variant: {
      control: 'inline-radio',
      options: ['accent', 'soft'],
      description: 'accent fill (default) or soft tint.',
    },
    shape: {
      control: 'inline-radio',
      options: ['circle', 'rounded'],
      description: 'Circle or rounded-square silhouette.',
    },
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
      description:
        'Fixed status palette, overriding variant (for profile-type avatars).',
    },
    size: {
      control: { type: 'range', min: 24, max: 72, step: 4 },
      description: 'Pixel size (width/height); font scales with it.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Accent: Story = {};
export const Soft: Story = { args: { variant: 'soft' } };
export const Rounded: Story = { args: { shape: 'rounded' } };
export const TonedTeal: Story = { args: { tone: 'teal' } };
