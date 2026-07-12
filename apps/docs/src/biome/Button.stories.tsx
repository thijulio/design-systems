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
      description:
        'Visual weight. primary = filled mata; secondary = outline; ghost = text-only warm.',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Control size.',
    },
    href: {
      control: 'text',
      description:
        'Render as an anchor instead of a button. Ignored when disabled.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Large: Story = { args: { size: 'lg' } };
