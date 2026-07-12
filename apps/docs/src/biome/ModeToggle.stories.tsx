import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ModeToggle } from '@thijulio/biome-react';
import type { Mode } from '@thijulio/biome-react';

const meta: Meta<typeof ModeToggle> = {
  title: 'Biome/Components/ModeToggle',
  component: ModeToggle,
  argTypes: {
    value: {
      description: 'Currently selected posture (Explorer / Recruiter).',
    },
    onChange: { description: 'Called with the newly selected mode.' },
  },
};
export default meta;

type Story = StoryObj<typeof ModeToggle>;

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<Mode>('explorer');
    return <ModeToggle value={value} onChange={setValue} />;
  },
  // Interaction test: clicking Recruiter switches the selected posture.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const recruiter = canvas.getByRole('tab', { name: 'Recruiter' });
    await expect(recruiter).toHaveAttribute('aria-selected', 'false');
    await userEvent.click(recruiter);
    await expect(recruiter).toHaveAttribute('aria-selected', 'true');
  },
};
