import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@thijulio/biome-react';

const meta: Meta<typeof Button> = {
  title: 'Biome/Components/Button',
  component: Button,
  args: { children: 'Grow software' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Large: Story = { args: { size: 'lg' } };
