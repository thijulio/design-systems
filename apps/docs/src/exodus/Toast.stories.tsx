import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Toast } from '@thijulio/exodus-react';

const meta: Meta<typeof Toast> = {
  title: 'Exodus/Feedback/Toast',
  component: Toast,
  args: {
    title: 'Changes saved',
    children: 'Your updates are live.',
    onClose: () => undefined,
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['success', 'warning', 'danger', 'info'],
      description: 'Accent stripe + icon colour for the message intent.',
    },
    title: { description: 'Bold headline line.' },
    onClose: { description: 'Called when the dismiss (×) button is clicked.' },
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

type Story = StoryObj<typeof Toast>;

export const Info: Story = {
  args: { onClose: fn() },
  // Interaction test: clicking the dismiss button fires onClose.
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /dismiss/i }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};
export const Success: Story = { args: { tone: 'success' } };
export const Danger: Story = {
  args: { tone: 'danger', title: 'Upload failed', children: 'Please retry.' },
};
