import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState, Button, NavIcon } from '@thijulio/exodus-react';

const meta: Meta<typeof EmptyState> = {
  title: 'Exodus/EmptyState',
  component: EmptyState,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: <NavIcon name="animals" />,
    title: 'No animals yet',
    children: 'Add your first record to start tracking the colony.',
    action: <Button size="sm">Add animal</Button>,
  },
};
