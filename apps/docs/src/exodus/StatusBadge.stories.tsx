import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBadge } from '@thijulio/exodus-react';
import type { LifecycleState } from '@thijulio/exodus-react';

const ALL_STATES: LifecycleState[] = [
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
];

const meta: Meta<typeof StatusBadge> = {
  title: 'Exodus/Feedback/StatusBadge',
  component: StatusBadge,
};
export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Single: Story = { args: { state: 'active' } };

/** The 13 lifecycle states, each mapped to its fixed tone. */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 520 }}>
      {ALL_STATES.map((state) => (
        <StatusBadge key={state} state={state} />
      ))}
    </div>
  ),
};
