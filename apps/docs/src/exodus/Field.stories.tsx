import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, Input } from '@thijulio/exodus-react';

const meta: Meta<typeof Field> = {
  title: 'Exodus/Forms/Field',
  component: Field,
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
