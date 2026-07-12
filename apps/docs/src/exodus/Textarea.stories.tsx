import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from '@thijulio/exodus-react';

const meta: Meta<typeof Textarea> = {
  title: 'Exodus/Forms/Textarea',
  component: Textarea,
  args: { placeholder: 'Notes about this animal…', rows: 4 },
  argTypes: {
    invalid: {
      control: 'boolean',
      description: 'Flip to the danger outline.',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true } };
