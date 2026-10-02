import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox } from '@thijulio/exodus-react';

const meta: Meta<typeof Checkbox> = {
  title: 'Exodus/Forms/Checkbox',
  component: Checkbox,
  argTypes: {
    label: { description: 'Label rendered beside the box.' },
  },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: { checked: true, label: 'Vaccinated', readOnly: true },
};
export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <Checkbox
        checked={checked}
        label="Vaccinated"
        onChange={(e) => setChecked(e.target.checked)}
      />
    );
  },
  // Interaction test: the native control remains keyboard-operable.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox');
    await expect(box).toBeChecked();
    box.focus();
    await userEvent.keyboard(' ');
    await expect(box).not.toBeChecked();
  },
};
