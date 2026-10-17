import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState, Button, NavIcon } from '@thijulio/exodus-react';

const meta: Meta<typeof EmptyState> = {
  title: 'Exodus/Components/EmptyState',
  component: EmptyState,
  argTypes: {
    icon: { description: 'Icon rendered in the accent tile.' },
    title: { description: 'Optional headline for the empty state.' },
    headingLevel: {
      control: 'inline-radio',
      options: [2, 3, 4, 5, 6],
      description: 'Heading element for the title (default 3).',
    },
    action: { description: 'Optional action slot (e.g. a Button).' },
    size: {
      control: 'inline-radio',
      options: ['md', 'sm'],
      description: 'md (default) is a roomy panel; sm is compact.',
    },
    surface: {
      control: 'inline-radio',
      options: ['dashed', 'none'],
      description: 'dashed (default) draws the panel; none sits in the flow.',
    },
    align: {
      control: 'inline-radio',
      options: ['center', 'start'],
      description: 'Content alignment (default center).',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: <NavIcon name="animals" />,
    title: 'No animals yet',
    children: 'Add your first record to start tracking the colony.',
    action: <Button size="sm">Add animal</Button>,
  },
};

/** No title: the message alone, still on the dashed panel. */
export const MessageOnly: Story = {
  args: {
    children: 'Nothing matches these filters.',
  },
};

/** Compact panel for an empty list inside a section or a form. */
export const Compact: Story = {
  args: {
    size: 'sm',
    align: 'start',
    title: 'No matches',
    children: 'Try a shorter search term.',
    action: (
      <Button size="sm" variant="secondary">
        Clear search
      </Button>
    ),
  },
};

/** Inline: no surface and no padding, a muted line in the page flow. */
export const Inline: Story = {
  args: {
    size: 'sm',
    surface: 'none',
    align: 'start',
    children: 'No entries recorded yet.',
  },
};
