import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '@thijulio/exodus-react';

const meta: Meta<typeof Input> = {
  title: 'Exodus/Input',
  component: Input,
  args: { placeholder: 'Search animals…' },
  argTypes: { invalid: { control: 'boolean' } },
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

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true, defaultValue: 'nope' } };
export const Disabled: Story = { args: { disabled: true, value: 'Locked' } };
