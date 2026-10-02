import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '@thijulio/faune-react';

const meta: Meta<typeof Input> = {
  title: 'Faune/Components/Input',
  component: Input,
  args: { placeholder: 'Nom du chat' },
  argTypes: {
    invalid: { description: 'Flip to the danger outline.' },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true, defaultValue: 'Roc' } };
