import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from '@thijulio/faune-react';

const meta: Meta<typeof Textarea> = {
  title: 'Faune/Components/Textarea',
  component: Textarea,
  args: { placeholder: 'Notes pour la visite…' },
  argTypes: {
    invalid: { description: 'Flip to the danger outline.' },
  },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};
export const Invalid: Story = {
  args: { invalid: true, defaultValue: 'Pas de croquettes ?' },
};
