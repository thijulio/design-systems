import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '@thijulio/primitives';

const meta: Meta<typeof Avatar> = {
  title: 'Faune/Components/Avatar',
  component: Avatar,
  args: { initials: 'KT' },
  argTypes: {
    size: { control: 'number', description: 'Pixel size (width/height).' },
    variant: {
      control: 'inline-radio',
      options: ['brand', 'accent', 'neutral'],
    },
    shape: { control: 'inline-radio', options: ['circle', 'rounded'] },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Brand: Story = {};
export const Accent: Story = { args: { variant: 'accent', initials: 'TR' } };
export const Neutral: Story = { args: { variant: 'neutral', initials: 'MF' } };
export const RoundedLarge: Story = {
  args: { size: 56, shape: 'rounded', initials: 'KT' },
};
