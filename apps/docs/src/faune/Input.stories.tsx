import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input, Textarea } from '@thijulio/primitives';

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

export const TextArea: StoryObj<typeof Textarea> = {
  render: (args) => <Textarea {...args} />,
  args: { placeholder: 'Notes pour la visite…', defaultValue: '' },
};
