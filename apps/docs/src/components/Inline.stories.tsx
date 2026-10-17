import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Badge, Button, Inline, Text } from '@thijulio/primitives';

const meta: Meta<typeof Inline> = {
  title: 'Components/Inline',
  component: Inline,
  args: { gap: 2 },
  argTypes: {
    as: {
      control: 'inline-radio',
      options: ['div', 'ul', 'nav'],
      description: 'Element to render.',
    },
    gap: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16],
      description: 'Space between items, on the space scale.',
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'baseline', 'stretch'],
      description: 'Cross-axis alignment (default center).',
    },
    justify: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'between'],
      description: 'Main-axis distribution.',
    },
    wrap: { description: 'Let items flow onto new lines.' },
  },
  render: (args) => (
    <Inline {...args}>
      <Button variant="secondary">Cancel</Button>
      <Button>Save</Button>
    </Inline>
  ),
};
export default meta;

type Story = StoryObj<typeof Inline>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole('button');
    await expect(buttons).toHaveLength(2);
    await expect(buttons[1]).toHaveAccessibleName('Save');
  },
};

// A title on one side, actions on the other.
export const SpaceBetween: Story = {
  args: { justify: 'between' },
  render: (args) => (
    <Inline {...args}>
      <Text weight="semibold">Team members</Text>
      <Button variant="secondary">Invite</Button>
    </Inline>
  ),
};

// A wrapping cluster of labels.
export const Wrapping: Story = {
  args: { wrap: true, gap: 2 },
  render: (args) => (
    <Inline {...args} style={{ maxWidth: 280 }}>
      {['Design', 'Research', 'Engineering', 'Marketing', 'Support'].map(
        (label) => (
          <Badge key={label}>{label}</Badge>
        ),
      )}
    </Inline>
  ),
};
