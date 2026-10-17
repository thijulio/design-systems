import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import {
  Field,
  Input,
  fieldErrorId,
  fieldHintId,
} from '@thijulio/exodus-react';

const meta: Meta<typeof Field> = {
  title: 'Exodus/Components/Field',
  component: Field,
  argTypes: {
    label: { description: 'Field label, associated via `htmlFor`.' },
    required: { description: 'Show the required indicator.' },
    hint: {
      description:
        'Helper text below the control, id `fieldHintId(htmlFor)` (hidden when `error` is set).',
    },
    error: {
      description:
        'Error text below the control, id `fieldErrorId(htmlFor)`, role="alert".',
    },
    htmlFor: {
      description:
        'id of the control: wires the label and names the hint/error ids.',
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

type Story = StoryObj<typeof Field>;

export const WithHint: Story = {
  args: {
    label: 'Animal name',
    htmlFor: 'field-name',
    hint: 'As it appears on records',
    children: (
      <Input
        id="field-name"
        placeholder="e.g. Luna"
        aria-describedby={fieldHintId('field-name')}
      />
    ),
  },
  // The hint describes the control without joining its accessible name.
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Animal name',
    });
    await expect(input).toHaveAccessibleDescription('As it appears on records');
  },
};

export const WithError: Story = {
  args: {
    label: 'Animal name',
    required: true,
    htmlFor: 'field-name-err',
    error: 'This field is required',
    children: (
      <Input
        id="field-name-err"
        invalid
        required
        defaultValue=""
        aria-describedby={fieldErrorId('field-name-err')}
      />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'This field is required',
    );
    await expect(
      canvas.getByRole('textbox', { name: 'Animal name' }),
    ).toHaveAccessibleDescription('This field is required');
  },
};
