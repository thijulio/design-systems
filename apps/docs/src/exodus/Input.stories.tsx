import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Input } from '@thijulio/exodus-react';

const meta: Meta<typeof Input> = {
  title: 'Exodus/Components/Input',
  component: Input,
  args: { id: 'animal-search', placeholder: 'Search animals…' },
  argTypes: {
    invalid: {
      control: 'boolean',
      description: 'Flip to the danger outline.',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <label htmlFor="animal-search">Animal search</label>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const Interactive: Story = {
  // Interaction test: typing updates the value.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Animal search' });
    await userEvent.type(input, 'Luna');
    await expect(input).toHaveValue('Luna');
  },
};
export const Invalid: Story = { args: { invalid: true, defaultValue: 'nope' } };
export const Disabled: Story = { args: { disabled: true, value: 'Locked' } };
