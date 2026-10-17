import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import {
  Button,
  Icon,
  Stack,
  Text,
  VisuallyHidden,
} from '@thijulio/primitives';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Components/VisuallyHidden',
  component: VisuallyHidden,
  argTypes: {
    as: {
      control: 'inline-radio',
      options: ['span', 'div', 'a', 'h2'],
      description: 'Element to render; defaults to `span`.',
    },
    focusable: {
      description: 'Reveal while it (or a descendant) has focus: skip links.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof VisuallyHidden>;

// Gives an icon-only button its accessible name.
export const Default: Story = {
  render: (args) => (
    <Button variant="secondary">
      <Icon name="trash" size={16} />
      <VisuallyHidden {...args}>Delete draft</VisuallyHidden>
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button).toHaveAccessibleName('Delete draft');
  },
};

// Extra context for screen readers on a terse visible label.
export const ExtraContext: Story = {
  render: (args) => (
    <Text>
      4.8
      <VisuallyHidden {...args}> out of 5 stars</VisuallyHidden>
    </Text>
  ),
};

// Tab into the canvas to reveal the skip link.
export const SkipLink: Story = {
  args: { as: 'a', href: '#main-content', focusable: true },
  render: (args) => (
    <Stack gap={4}>
      <VisuallyHidden {...args}>Skip to main content</VisuallyHidden>
      <Text id="main-content">Main content starts here.</Text>
    </Stack>
  ),
};
