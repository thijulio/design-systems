import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { FileInput } from '@thijulio/primitives';

const meta: Meta<typeof FileInput> = {
  title: 'Components/FileInput',
  component: FileInput,
  args: {
    label: 'Pet photo',
    chooseLabel: 'Choose file',
    noFileLabel: 'No file chosen',
    name: 'pet-photo',
    accept: 'image/*',
  },
  argTypes: {
    chooseLabel: {
      description: 'Text of the visible choose button (no default copy).',
    },
    noFileLabel: {
      description: 'Status text while nothing is chosen (no default copy).',
    },
    fileLabel: {
      description:
        'Status text once a file is chosen; unset, the file names show.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof FileInput>;

export const Default: Story = {};

export const WithHint: Story = { args: { hint: 'PNG or JPEG, up to 5 MB.' } };

// The role="alert" error replaces the hint and marks the input invalid.
export const WithError: Story = {
  args: { hint: 'PNG or JPEG, up to 5 MB.', error: 'This file is too large.' },
};

export const Disabled: Story = { args: { disabled: true } };

// The transparent native input lies exactly over the choose button: it takes
// focus (the button shows the ring) and real pointer clicks.
export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const input = within(canvasElement).getByLabelText('Pet photo');
    await expect(input).toHaveFocus();
    const inputBox = input.getBoundingClientRect();
    const buttonBox = within(canvasElement)
      .getByText('Choose file')
      .getBoundingClientRect();
    await expect(inputBox.width).toBe(buttonBox.width);
    await expect(inputBox.height).toBe(buttonBox.height);
  },
};
