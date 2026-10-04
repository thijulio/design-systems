import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Select } from '@thijulio/exodus-react';

const meta: Meta<typeof Select> = {
  title: 'Exodus/Components/Select',
  component: Select,
  argTypes: {
    invalid: {
      control: 'boolean',
      description: 'Flip to the danger outline.',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <label>
      Species
      <Select {...args}>
        <option value="dog">Dog</option>
        <option value="cat">Cat</option>
        <option value="rabbit">Rabbit</option>
      </Select>
    </label>
  ),
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {};
export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Species' });
    await userEvent.selectOptions(select, 'cat');
    await expect(select).toHaveValue('cat');
  },
};
export const Invalid: Story = { args: { invalid: true } };
