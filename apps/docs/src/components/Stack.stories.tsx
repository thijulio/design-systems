import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button, Card, Stack, Text } from '@thijulio/primitives';

const meta: Meta<typeof Stack> = {
  title: 'Components/Stack',
  component: Stack,
  args: { gap: 4 },
  argTypes: {
    as: {
      control: 'inline-radio',
      options: ['div', 'section', 'ul'],
      description: 'Element to render; keeps list or landmark semantics.',
    },
    gap: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16],
      description: 'Vertical space between children, on the space scale.',
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'stretch'],
      description:
        'Cross-axis alignment; when set, the stack becomes a flex column.',
    },
  },
  render: (args) => (
    <Stack {...args}>
      <Card pad>
        <Text size="body-sm">Account details</Text>
      </Card>
      <Card pad>
        <Text size="body-sm">Notification preferences</Text>
      </Card>
      <Card pad>
        <Text size="body-sm">Billing history</Text>
      </Card>
    </Stack>
  ),
};
export default meta;

type Story = StoryObj<typeof Stack>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Account details')).toBeVisible();
    await expect(canvas.getByText('Billing history')).toBeVisible();
  },
};

// Tight rhythm for related lines of text.
export const Tight: Story = {
  args: { gap: 1 },
  render: (args) => (
    <Stack {...args}>
      <Text weight="semibold">Order #4821</Text>
      <Text size="body-sm" tone="muted">
        Shipped on 12 March
      </Text>
    </Stack>
  ),
};

// With `align`, children keep their own width instead of stretching.
export const AlignedStart: Story = {
  args: { gap: 3, align: 'start' },
  render: (args) => (
    <Stack {...args}>
      <Text>Your changes have not been saved yet.</Text>
      <Button variant="secondary">Save changes</Button>
    </Stack>
  ),
};
