import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from '@thijulio/exodus-react';

const meta: Meta<typeof Select> = {
  title: 'Exodus/Select',
  component: Select,
  argTypes: { invalid: { control: 'boolean' } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Select {...args}>
      <option value="dog">Dog</option>
      <option value="cat">Cat</option>
      <option value="rabbit">Rabbit</option>
    </Select>
  ),
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true } };
