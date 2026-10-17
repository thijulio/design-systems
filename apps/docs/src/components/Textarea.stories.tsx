import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from '@thijulio/primitives';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  args: { placeholder: 'Notes for the visit…', 'aria-label': 'Visit notes' },
  argTypes: {
    invalid: { description: 'Flip to the danger outline.' },
  },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};
export const Invalid: Story = {
  args: { invalid: true, defaultValue: 'No dry food?' },
};
