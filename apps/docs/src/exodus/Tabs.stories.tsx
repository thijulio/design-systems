import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from '@thijulio/exodus-react';

const TABS = [
  { value: 'all', label: 'All', count: 128 },
  { value: 'active', label: 'Active', count: 42 },
  { value: 'archived', label: 'Archived' },
  { value: 'draft', label: 'Draft', disabled: true },
];

const meta: Meta<typeof Tabs> = {
  title: 'Exodus/Core/Tabs',
  component: Tabs,
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    return <Tabs tabs={TABS} value={value} onChange={setValue} />;
  },
};
