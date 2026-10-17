import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Divider, Stack, Text } from '@thijulio/primitives';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  argTypes: {
    className: {
      control: 'text',
      description: 'Extra class, e.g. for margins; the rule itself has none.',
    },
  },
  render: (args) => (
    <Stack gap={4}>
      <Text>Signed in as a workspace administrator.</Text>
      <Divider {...args} />
      <Text tone="secondary">Last sign-in two hours ago.</Text>
    </Stack>
  ),
};
export default meta;

type Story = StoryObj<typeof Divider>;

// A thematic break: an `<hr>`, exposed as a separator.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const rule = within(canvasElement).getByRole('separator');
    await expect(rule.tagName).toBe('HR');
  },
};
