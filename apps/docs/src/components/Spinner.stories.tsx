import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Spinner, Text } from '@thijulio/primitives';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  argTypes: {
    label: { description: 'Status text; no default copy.' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      description: 'Ring size (default md).',
    },
    labelVisible: {
      control: 'boolean',
      description:
        'Show the label beside the ring; it takes the surrounding text style.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Spinner>;

/** Ring only; the label is announced, not shown. */
export const Default: Story = {
  args: { label: 'Loading…' },
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole('status');
    await expect(status).toHaveTextContent('Loading…');
  },
};

/** A visible loading line: the label sits beside the ring. */
export const LabelVisible: Story = {
  args: { label: 'Loading…', size: 'sm', labelVisible: true },
};

/** A text primitive around the spinner sets the label's size and tone. */
export const InText: Story = {
  render: (args) => (
    <Text as="div" size="lead" tone="secondary">
      <Spinner {...args} />
    </Text>
  ),
  args: { label: 'Checking your link…', labelVisible: true },
};
