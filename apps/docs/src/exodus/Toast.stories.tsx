import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Toast } from '@thijulio/exodus-react';

const meta: Meta<typeof Toast> = {
  title: 'Exodus/Components/Toast',
  component: Toast,
  args: {
    title: 'Changes saved',
    children: 'Your updates are live.',
    onClose: () => undefined,
    dismissLabel: 'Dismiss',
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['success', 'warning', 'danger', 'info'],
      description: 'Accent stripe + icon colour for the message intent.',
    },
    title: {
      description:
        'Bold headline line. Omit it and the children take its place.',
    },
    announce: {
      description:
        'false renders no live role, for a toast inside a live ToastViewport.',
    },
    onClose: { description: 'Called when the dismiss (×) button is clicked.' },
    dismissLabel: {
      description:
        'Accessible name of the dismiss button (required with onClose; no English default).',
    },
    role: {
      description:
        'Defaults by tone: alert for danger/warning, status otherwise. Pass one to override.',
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

type Story = StoryObj<typeof Toast>;

export const Info: Story = {};
export const Interactive: Story = {
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
  // danger and warning interrupt: they render as role="alert".
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent(
      'Upload failed',
    );
  },
};

// No title: the message takes the headline's place.
export const MessageOnly: Story = {
  args: {
    tone: 'success',
    title: undefined,
    children: 'Application received.',
  },
};
