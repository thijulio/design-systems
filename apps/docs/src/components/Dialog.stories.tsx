import { useId, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  Button,
  Dialog,
  Inline,
  Input,
  Stack,
  Text,
  type DialogSize,
} from '@thijulio/primitives';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  argTypes: {
    open: { description: 'Whether the dialog is shown (controlled).' },
    onClose: {
      description: 'Called by the close control and on Escape.',
    },
    title: { description: 'Visible title; names the dialog.' },
    description: {
      description: 'Line under the title; describes the dialog.',
    },
    footer: { description: 'Actions row, e.g. Cancel / Save.' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Maximum width of the panel.',
    },
    closeLabel: {
      description: 'Accessible name of the close control (no default copy).',
    },
    initialFocusRef: {
      description:
        'Element to focus on open; defaults to the first tabbable control.',
    },
    role: {
      control: 'inline-radio',
      options: ['dialog', 'alertdialog'],
      description: 'alertdialog for confirmations that need a response.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Dialog>;

// The primitives have no labelled field wrapper: a native label names the Input.
const NameField = ({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue: string;
}) => {
  const id = useId();
  return (
    <Stack gap={2}>
      <label htmlFor={id}>{label}</label>
      <Input id={id} defaultValue={defaultValue} />
    </Stack>
  );
};

const EditDialog = ({ size = 'md' }: { size?: DialogSize }) => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit profile</Button>
      <Dialog
        open={open}
        onClose={close}
        size={size}
        title="Edit profile"
        description="This name is shown to people you work with."
        closeLabel="Close"
        footer={
          <Inline gap={2} justify="end">
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button onClick={close}>Save</Button>
          </Inline>
        }
      >
        <NameField label="Display name" defaultValue="Alex Morgan" />
      </Dialog>
    </>
  );
};

// Focus moves to the first control (the close button) on open, Escape
// closes, and focus goes back to the opener.
export const Default: Story = {
  render: () => <EditDialog />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const opener = within(canvasElement).getByRole('button', {
      name: 'Edit profile',
    });
    await userEvent.click(opener);
    const dialog = await page.findByRole('dialog', { name: 'Edit profile' });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAccessibleDescription(
      'This name is shown to people you work with.',
    );
    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: 'Close' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
    await expect(opener).toHaveFocus();
  },
};

export const Small: Story = { render: () => <EditDialog size="sm" /> };

export const Large: Story = { render: () => <EditDialog size="lg" /> };

// The dialog is portalled to <body>, outside the themed wrapper. With no
// `data-theme` of its own it takes the one around its focused opener.
export const InheritsTheme: Story = {
  render: () => (
    <div data-theme="clay">
      <EditDialog />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Edit profile' }),
    );
    const dialog = await page.findByRole('dialog', { name: 'Edit profile' });
    await waitFor(() => expect(dialog).toHaveAttribute('data-theme', 'clay'));
  },
};

const StackedDialogs = () => {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <Button onClick={() => setEditing(true)}>Edit item</Button>
      <Dialog
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit item"
        closeLabel="Close"
        footer={
          <Inline gap={2} justify="between">
            <Button
              variant="danger-outline"
              onClick={() => setConfirming(true)}
            >
              Delete item
            </Button>
            <Button onClick={() => setEditing(false)}>Save</Button>
          </Inline>
        }
      >
        <NameField label="Item name" defaultValue="Quarterly report" />
      </Dialog>
      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        role="alertdialog"
        size="sm"
        title="Delete this item?"
        description="This cannot be undone."
        closeLabel="Close"
        footer={
          <Inline gap={2} justify="end">
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Keep item
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirming(false);
                setEditing(false);
              }}
            >
              Delete
            </Button>
          </Inline>
        }
      >
        <Text>The item and its history will be removed.</Text>
      </Dialog>
    </>
  );
};

// A dialog opened from another one sits on top: only the top dialog answers
// Escape and Tab, and closing it hands focus back to its opener inside the
// first dialog. The second dialog inherits the theme through the first.
export const Stacked: Story = {
  render: () => (
    <div data-theme="harbor">
      <Stack gap={2} align="start">
        <StackedDialogs />
      </Stack>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const opener = within(canvasElement).getByRole('button', {
      name: 'Edit item',
    });
    await userEvent.click(opener);
    const first = await page.findByRole('dialog', { name: 'Edit item' });
    const deleteButton = within(first).getByRole('button', {
      name: 'Delete item',
    });
    await userEvent.click(deleteButton);
    const second = await page.findByRole('alertdialog', {
      name: 'Delete this item?',
    });
    await waitFor(() => expect(second).toHaveAttribute('data-theme', 'harbor'));
    await waitFor(() =>
      expect(
        within(second).getByRole('button', { name: 'Close' }),
      ).toHaveFocus(),
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('alertdialog')).toBeNull());
    await expect(first).toBeVisible();
    await expect(deleteButton).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
    await expect(opener).toHaveFocus();
  },
};
