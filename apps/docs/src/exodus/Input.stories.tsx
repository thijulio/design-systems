import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Input } from '@thijulio/exodus-react';

const meta: Meta<typeof Input> = {
  title: 'Exodus/Forms/Input',
  component: Input,
  args: { placeholder: 'Search animals…' },
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
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  // Interaction test: typing updates the value.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Search animals…');
    await userEvent.type(input, 'Luna');
    await expect(input).toHaveValue('Luna');
  },
};
export const Invalid: Story = { args: { invalid: true, defaultValue: 'nope' } };
export const Disabled: Story = { args: { disabled: true, value: 'Locked' } };
