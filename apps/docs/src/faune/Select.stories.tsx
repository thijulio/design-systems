import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from '@thijulio/faune-react';

const meta: Meta<typeof Select> = {
  title: 'Faune/Components/Select',
  component: Select,
  argTypes: {
    invalid: { description: 'Flip to the danger outline.' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Select aria-label="Durée de la visite" {...args}>
      <option value="30">30 minutes</option>
      <option value="45">45 minutes</option>
      <option value="60">1 heure</option>
    </Select>
  ),
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true } };
