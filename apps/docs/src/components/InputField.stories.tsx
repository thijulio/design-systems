import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { InputField, SelectField, TextareaField } from '@thijulio/primitives';

const meta: Meta<typeof InputField> = {
  title: 'Components/InputField',
  component: InputField,
  args: { label: 'Full name', name: 'full-name', autoComplete: 'name' },
  argTypes: {
    label: {
      description:
        'Visible `<label htmlFor>` holding only this text; omit it only when the control is named otherwise (`aria-label`).',
    },
    hint: {
      description: 'Help text, id `${id}-hint`; describes the control.',
    },
    error: {
      description:
        'Error text, id `${id}-error`, role="alert"; replaces the hint and sets aria-invalid.',
    },
    requiredMarker: {
      description:
        'Show the decorative `*` (hidden from assistive tech). Set `required` for the constraint.',
    },
    wrapperClassName: {
      description: 'Class for the field root; `className` styles the control.',
    },
    id: {
      description:
        'Control id; defaults to a generated id (never `name`, which may repeat).',
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

type Story = StoryObj<typeof InputField>;

// The label names the input, the hint describes it, and Tab reaches it.
export const Default: Story = {
  args: { hint: 'As it appears on your ID' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Full name',
    });
    await expect(input).toHaveAccessibleDescription('As it appears on your ID');
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await userEvent.keyboard('Ada');
    await expect(input).toHaveValue('Ada');
  },
};

// The error replaces the hint as the description and marks the input invalid.
export const WithError: Story = {
  args: {
    hint: 'As it appears on your ID',
    error: 'Enter your full name.',
    required: true,
    requiredMarker: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Full name' });
    await expect(input).toBeRequired();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Enter your full name.',
    );
    await expect(input).toHaveAccessibleDescription('Enter your full name.');
    await expect(canvas.queryByText('As it appears on your ID')).toBeNull();
  },
};

export const Select: Story = {
  render: () => (
    <SelectField label="Country" name="country" hint="Where you live">
      <option value="fr">France</option>
      <option value="pt">Portugal</option>
    </SelectField>
  ),
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole('combobox', {
      name: 'Country',
    });
    await expect(select).toHaveAccessibleDescription('Where you live');
    await userEvent.selectOptions(select, 'pt');
    await expect(select).toHaveValue('pt');
  },
};

export const Textarea: Story = {
  render: () => (
    <TextareaField label="Message" name="message" hint="Two lines at most" />
  ),
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole('textbox', {
      name: 'Message',
    });
    await expect(textarea).toHaveAccessibleDescription('Two lines at most');
  },
};
