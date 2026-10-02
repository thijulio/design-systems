import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '@thijulio/faune-react';
import { expect, within } from 'storybook/test';
import { contrastRatio } from '../_test/contrast';

const meta: Meta<typeof Avatar> = {
  title: 'Faune/Components/Avatar',
  component: Avatar,
  args: { initials: 'KT' },
  argTypes: {
    size: { control: 'number', description: 'Pixel size (width/height).' },
    variant: {
      control: 'inline-radio',
      options: ['brand', 'accent', 'neutral'],
      description: 'brand fill (default), accent fill, or neutral.',
    },
    shape: {
      control: 'inline-radio',
      options: ['circle', 'rounded'],
      description: 'circle (default) or rounded.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Brand: Story = {};
export const Accent: Story = { args: { variant: 'accent', initials: 'TR' } };
export const Neutral: Story = { args: { variant: 'neutral', initials: 'MF' } };
export const Warning: Story = {
  args: { tone: 'warning', initials: 'KT' },
  play: async ({ canvasElement }) => {
    const style = getComputedStyle(within(canvasElement).getByText('KT'));
    await expect(
      contrastRatio(style.color, style.backgroundColor),
    ).toBeGreaterThanOrEqual(4.5);
  },
};
export const RoundedLarge: Story = {
  args: { size: 56, shape: 'rounded', initials: 'KT' },
};
