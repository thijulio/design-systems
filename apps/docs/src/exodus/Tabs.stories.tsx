import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
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
  argTypes: {
    tabs: { description: 'The tab items (value + label) to render.' },
    value: { description: 'Currently selected tab value.' },
    onChange: { description: 'Called with the newly selected tab value.' },
  },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    return <Tabs tabs={TABS} value={value} onChange={setValue} />;
  },
  // Interaction test: clicking a tab selects it.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const active = canvas.getByRole('tab', { name: /Active/ });
    await expect(active).toHaveAttribute('aria-selected', 'false');
    await userEvent.click(active);
    await expect(active).toHaveAttribute('aria-selected', 'true');
  },
};
