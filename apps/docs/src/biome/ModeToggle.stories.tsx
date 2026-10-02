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

export const Default: Story = {
  args: { value: 'explorer' },
};
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<Mode>('explorer');
    return <ModeToggle value={value} onChange={setValue} />;
  },
  // Interaction test: pointer and keyboard controls switch the selected posture.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const recruiter = canvas.getByRole('tab', { name: 'Recruiter' });
    await expect(recruiter).toHaveAttribute('aria-selected', 'false');
    await userEvent.click(recruiter);
    await expect(recruiter).toHaveAttribute('aria-selected', 'true');
    recruiter.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('tab', { name: 'Explorer' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};
