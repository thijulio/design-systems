import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, Toast, ToastViewport } from '@thijulio/primitives';

const meta: Meta<typeof ToastViewport> = {
  title: 'Components/ToastViewport',
  component: ToastViewport,
  args: { label: 'Notifications', onPause: fn(), onResume: fn() },
  argTypes: {
    label: {
      description:
        'Accessible name of the region (required; no English default).',
    },
    onPause: {
      description:
        'Called once a toast is hovered or focus enters the strip: stop the auto-dismiss timers (WCAG 2.2.1).',
    },
    onResume: {
      description:
        'Called once the strip is neither hovered nor focused: restart the timers with the time left.',
    },
  },
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof ToastViewport>;

// The region stays mounted and is the only live region: each toast passes
// announce={false} so it is read once, on insertion.
export const Stacked: Story = {
  render: (args) => (
    <ToastViewport {...args}>
      <Toast tone="success" announce={false}>
        Application received.
      </Toast>
      <Toast
        tone="danger"
        title="Upload failed"
        announce={false}
        onClose={() => undefined}
        dismissLabel="Dismiss"
      >
        Please retry.
      </Toast>
    </ToastViewport>
  ),
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole('status', {
      name: 'Notifications',
    });
    await expect(region).toHaveAttribute('aria-live', 'polite');
    await expect(within(region).queryByRole('alert')).toBeNull();
  },
};

function Live(args: Story['args']) {
  const [toasts, setToasts] = useState<number[]>([]);
  const raise = () => setToasts((current) => [...current, Date.now()]);
  const dismiss = (id: number) =>
    setToasts((current) => current.filter((toast) => toast !== id));
  return (
    <>
      <div style={{ padding: 24 }}>
        <Button onClick={raise}>Save</Button>
      </div>
      <ToastViewport label="Notifications" {...args}>
        {toasts.map((id) => (
          <Toast
            key={id}
            tone="success"
            announce={false}
            onClose={() => dismiss(id)}
            dismissLabel="Dismiss"
          >
            Changes saved.
          </Toast>
        ))}
      </ToastViewport>
    </>
  );
}

// Interaction test: a toast raised after mount lands in the region and can
// be dismissed.
export const Interactive: Story = {
  render: (args) => <Live {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    const region = canvas.getByRole('status', { name: 'Notifications' });
    await expect(region).toHaveTextContent('Changes saved.');
    await userEvent.click(
      within(region).getByRole('button', { name: 'Dismiss' }),
    );
    await expect(region).toBeEmptyDOMElement();
  },
};

// Interaction test: hovering or focusing a toast pauses the strip, and
// leaving both resumes it, once each.
export const PauseOnHoverAndFocus: Story = {
  render: (args) => (
    <>
      <ToastViewport {...args}>
        <Toast
          tone="info"
          announce={false}
          onClose={() => undefined}
          dismissLabel="Dismiss"
        >
          Hover or focus me to pause.
        </Toast>
      </ToastViewport>
      <div style={{ padding: 24 }}>
        <Button>Elsewhere</Button>
      </div>
    </>
  ),
  play: async ({ args, canvasElement }) => {
    const region = within(canvasElement).getByRole('status', {
      name: 'Notifications',
    });
    const toast = within(region).getByText('Hover or focus me to pause.');
    await userEvent.hover(toast);
    await expect(args.onPause).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    await expect(
      within(region).getByRole('button', { name: 'Dismiss' }),
    ).toHaveFocus();
    await userEvent.unhover(toast);
    await expect(args.onResume).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(
      within(canvasElement).getByRole('button', { name: 'Elsewhere' }),
    ).toHaveFocus();
    await expect(args.onResume).toHaveBeenCalledTimes(1);
    await expect(args.onPause).toHaveBeenCalledTimes(1);
  },
};
