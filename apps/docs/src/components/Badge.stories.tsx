import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '@thijulio/primitives';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: '12' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: [
        'neutral',
        'brand',
        'accent',
        'success',
        'warning',
        'danger',
        'info',
      ],
      description: 'Fixed label/count palette.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Neutral: Story = {};
export const Success: Story = {
  args: { tone: 'success', children: 'Confirmed' },
};
export const Warning: Story = {
  args: { tone: 'warning', children: 'Pending' },
};
export const Danger: Story = { args: { tone: 'danger', children: 'Urgent' } };
