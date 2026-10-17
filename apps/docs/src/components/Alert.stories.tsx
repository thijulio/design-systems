import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Alert, Button, Icon, Stack } from '@thijulio/primitives';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  args: {
    tone: 'info',
    title: 'Scheduled maintenance',
    children: 'The service will be unavailable on Sunday from 02:00 to 04:00.',
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'info', 'success', 'warning', 'danger'],
      description: 'Tint and intent of the callout.',
    },
    title: { description: 'Bold first line.' },
    action: { description: 'Trailing control, e.g. a retry Button.' },
    live: {
      control: 'inline-radio',
      options: ['off', 'polite', 'assertive'],
      description:
        'off: no role; polite: role="status"; assertive: role="alert". An explicit role wins.',
    },
    icon: {
      description: 'Leading decorative icon (hidden from assistive tech).',
    },
    as: { description: 'Element to render; defaults to div.' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Alert>;

// A static callout has no live role: it is read in document order.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('status')).toBeNull();
    await expect(canvas.queryByRole('alert')).toBeNull();
    await expect(canvas.getByText('Scheduled maintenance')).toBeVisible();
  },
};

export const Tones: Story = {
  render: (args) => (
    <Stack gap={3}>
      <Alert {...args} tone="neutral" title="Neutral">
        Drafts are kept for 30 days.
      </Alert>
      <Alert {...args} tone="info" title="Info">
        A new version is available.
      </Alert>
      <Alert {...args} tone="success" title="Success">
        Your settings were saved.
      </Alert>
      <Alert {...args} tone="warning" title="Warning">
        Your session expires in 5 minutes.
      </Alert>
      <Alert {...args} tone="danger" title="Danger">
        The payment could not be processed.
      </Alert>
    </Stack>
  ),
};

export const WithIcon: Story = {
  args: {
    tone: 'warning',
    title: 'Storage almost full',
    children: 'You have used 92% of your storage.',
    icon: <Icon name="alert" size={18} />,
  },
};

// Body text only: no title, icon or action, so the children render directly.
export const PlainText: Story = {
  args: {
    tone: 'neutral',
    title: undefined,
    children: 'Changes apply to new items only.',
  },
};

// polite → role="status": announced when the screen reader is idle.
export const Polite: Story = {
  args: {
    tone: 'success',
    live: 'polite',
    title: 'Upload complete',
    children: '3 files were added to the folder.',
  },
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole('status');
    await expect(status).toHaveTextContent('Upload complete');
  },
};

// assertive → role="alert"; the action stays a reachable button inside it.
export const AssertiveWithAction: Story = {
  args: {
    tone: 'danger',
    live: 'assertive',
    title: 'Connection lost',
    children: 'We could not reach the server.',
    icon: <Icon name="alert" size={18} />,
  },
  render: (args) => (
    <Alert {...args} action={<Button variant="secondary">Retry</Button>} />
  ),
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole('alert');
    await expect(alert).toHaveTextContent('Connection lost');
    await userEvent.tab();
    await expect(
      within(alert).getByRole('button', { name: 'Retry' }),
    ).toHaveFocus();
  },
};
