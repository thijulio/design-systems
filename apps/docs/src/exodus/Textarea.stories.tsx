import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Textarea } from '@thijulio/exodus-react';

const meta: Meta<typeof Textarea> = {
  title: 'Exodus/Components/Textarea',
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
        <label htmlFor="animal-notes">Animal notes</label>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = { args: { id: 'animal-notes' } };
export const Interactive: Story = {
  args: { id: 'animal-notes' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Animal notes' });
    await userEvent.type(textarea, 'Needs a follow-up visit.');
    await expect(textarea).toHaveValue('Needs a follow-up visit.');
  },
};
export const Invalid: Story = { args: { invalid: true } };
