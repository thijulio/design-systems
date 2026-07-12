import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '@thijulio/exodus-react';

const meta: Meta<typeof Checkbox> = {
  title: 'Exodus/Forms/Checkbox',
  component: Checkbox,
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

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
};
