import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Toast } from '@thijulio/primitives';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  args: {
    tone: 'info',
    title: 'Changes saved',
    children: 'Your updates are live.',
    onClose: fn(),
    dismissLabel: 'Dismiss',
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['success', 'warning', 'danger', 'info'],
      description:
        'Colour of the leading bar. Also picks the default live role.',
    },
    title: {
      description:
        'Bold headline line. Omit it and the children take its place.',
    },
    announce: {
      description:
        'false renders no live role, for a toast inside a live ToastViewport.',
    },
    onClose: {
      description: 'Renders the dismiss (×) button, which calls it.',
    },
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

// info and success wait their turn: they render as role="status".
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const toast = within(canvasElement).getByRole('status');
    await expect(toast).toHaveTextContent('Changes saved');
  },
};

// Interaction test: the dismiss button is reachable by Tab and fires onClose
// from the keyboard and the pointer.
export const Dismissible: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const dismiss = canvas.getByRole('button', { name: 'Dismiss' });
    await userEvent.tab();
    await expect(dismiss).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await userEvent.click(dismiss);
    await expect(args.onClose).toHaveBeenCalledTimes(2);
  },
};

export const Success: Story = { args: { tone: 'success' } };

export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'Session ending',
    children: 'You will be signed out in two minutes.',
  },
};

// danger and warning interrupt: they render as role="alert".
export const Danger: Story = {
  args: { tone: 'danger', title: 'Upload failed', children: 'Please retry.' },
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

// Inside a live ToastViewport: no role of its own, so it is read once.
export const Silent: Story = {
  args: { announce: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('status')).toBeNull();
    await expect(canvas.getByText('Changes saved')).toBeVisible();
  },
};

// No onClose: no dismiss button.
export const Persistent: Story = {
  args: { onClose: undefined, dismissLabel: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};
