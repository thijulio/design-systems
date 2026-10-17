import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { InputField, SelectField, TextareaField } from '@thijulio/exodus-react';

const meta: Meta<typeof InputField> = {
  title: 'Exodus/Components/InputField',
  component: InputField,
  args: { label: 'Animal name', name: 'animal-name', placeholder: 'e.g. Luna' },
  argTypes: {
    label: {
      description:
        'Visible `<label htmlFor>` holding only this text; omit it only when the control is named otherwise.',
    },
    hint: {
      description: 'Help text, id `${id}-hint`; describes the control.',
    },
    error: {
      description:
        'Error text, id `${id}-error`, role="alert"; replaces the hint and sets aria-invalid.',
    },
    requiredMarker: { description: 'Show the decorative `*` marker.' },
    wrapperClassName: { description: 'Class for the field root.' },
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

type Story = StoryObj<typeof InputField>;

export const WithHint: Story = {
  args: { hint: 'As it appears on records' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Animal name',
    });
    await expect(input).toHaveAttribute('id', 'animal-name');
    await expect(input).toHaveAccessibleDescription('As it appears on records');
  },
};

export const WithError: Story = {
  args: {
    hint: 'As it appears on records',
    error: 'This field is required',
    required: true,
    requiredMarker: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Animal name' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('This field is required');
    await expect(canvas.queryByText('As it appears on records')).toBeNull();
  },
};

export const Select: Story = {
  render: () => (
    <SelectField label="Species" name="species" hint="Pick one">
      <option value="dog">Dog</option>
      <option value="cat">Cat</option>
    </SelectField>
  ),
};

export const Textarea: Story = {
  render: () => (
    <TextareaField
      label="Notes"
      name="notes"
      hint="Visible to the adoption team only"
    />
  ),
};
