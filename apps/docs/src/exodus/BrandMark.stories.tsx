import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrandMark } from '@thijulio/exodus-react';

const meta: Meta<typeof BrandMark> = {
  title: 'Exodus/BrandMark',
  component: BrandMark,
  args: { name: 'Companion' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    wordmarkFont: { control: 'inline-radio', options: ['sans', 'baloo'] },
  },
};
export default meta;

type Story = StoryObj<typeof BrandMark>;

export const Companion: Story = {};
export const Vivarium: Story = { args: { name: 'Vivarium' } };
export const PmpWordmark: Story = {
  args: { name: 'PMP', wordmarkFont: 'baloo', size: 'lg' },
};
