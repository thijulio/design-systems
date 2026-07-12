import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModeToggle } from '@thijulio/biome-react';
import type { Mode } from '@thijulio/biome-react';

const meta: Meta<typeof ModeToggle> = {
  title: 'Biome/Components/ModeToggle',
  component: ModeToggle,
};
export default meta;

type Story = StoryObj<typeof ModeToggle>;

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<Mode>('explorer');
    return <ModeToggle value={value} onChange={setValue} />;
  },
};
