import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, Input } from '@thijulio/exodus-react';

const meta: Meta<typeof Field> = {
  title: 'Exodus/Forms/Field',
  component: Field,
  argTypes: {
    label: { description: 'Field label, associated via `htmlFor`.' },
    required: { description: 'Show the required indicator.' },
    hint: {
      description:
        'Helper text shown below the control (hidden when `error` is set).',
    },
    error: {
      description: 'Error text shown below the control, in danger colour.',
    },
    htmlFor: { description: 'id of the control this label points at.' },
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
    children: <Input id="field-name" placeholder="e.g. Luna" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Animal name',
    required: true,
    htmlFor: 'field-name-err',
    error: 'This field is required',
    children: <Input id="field-name-err" invalid defaultValue="" />,
  },
};
