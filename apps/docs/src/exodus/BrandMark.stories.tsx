import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrandMark } from '@thijulio/exodus-react';

const meta: Meta<typeof BrandMark> = {
  title: 'Exodus/Identity/BrandMark',
  component: BrandMark,
  args: { name: 'Companion' },
  argTypes: {
    name: { description: 'Product name / wordmark text.' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Mark + wordmark size.',
    },
    wordmarkFont: {
      control: 'inline-radio',
      options: ['sans', 'baloo'],
      description:
        '`baloo` uses the reserved wordmark face (var(--font-wordmark)).',
    },
  },
};
export default meta;

type Story = StoryObj<typeof BrandMark>;

export const Companion: Story = {};
export const Vivarium: Story = { args: { name: 'Vivarium' } };
export const PmpWordmark: Story = {
  args: { name: 'PMP', wordmarkFont: 'baloo', size: 'lg' },
};
