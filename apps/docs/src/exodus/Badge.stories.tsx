import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '@thijulio/exodus-react';

const meta: Meta<typeof Badge> = {
  title: 'Exodus/Badge',
  component: Badge,
  args: { children: '12' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'accent', 'success', 'warning', 'danger', 'info'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Neutral: Story = {};
export const Accent: Story = { args: { tone: 'accent', children: 'New' } };
export const Success: Story = { args: { tone: 'success', children: 'Paid' } };
export const Danger: Story = { args: { tone: 'danger', children: '3' } };
