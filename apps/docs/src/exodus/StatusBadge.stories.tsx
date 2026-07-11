import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBadge } from '@thijulio/exodus-react';

const meta: Meta<typeof StatusBadge> = {
  title: 'Exodus/StatusBadge',
  component: StatusBadge,
};
export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Single: Story = { args: { state: 'active' } };

/** The 13 lifecycle states, each mapped to its fixed tone. */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 520 }}>
      {(
        [
          'draft',
          'pending',
          'awaiting-review',
          'on-hold',
          'confirmed',
          'reserved',
          'active',
          'available',
          'completed',
          'adopted',
          'quarantined',
          'cancelled',
          'archived',
        ] as const
      ).map((state) => (
        <StatusBadge key={state} state={state} />
      ))}
    </div>
  ),
};
