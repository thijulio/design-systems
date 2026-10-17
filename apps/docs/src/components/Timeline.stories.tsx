import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import {
  Button,
  Heading,
  Text,
  Timeline,
  TimelineItem,
} from '@thijulio/primitives';

const meta: Meta<typeof Timeline> = {
  title: 'Components/Timeline',
  component: Timeline,
  args: { gap: 3, marker: 'dot', rail: false },
  argTypes: {
    marker: {
      control: 'inline-radio',
      options: ['dot', 'none'],
      description: 'A dot before each item, coloured by the item `tone`.',
    },
    rail: {
      description: 'A rule along the inline start edge, through the dots.',
    },
    gap: { description: 'Space between items.' },
  },
  render: (args) => (
    <Timeline {...args}>
      <TimelineItem title="Order placed" time="2 March" dateTime="2026-03-02" />
      <TimelineItem
        title="Payment confirmed"
        time="2 March"
        dateTime="2026-03-02"
      />
      <TimelineItem title="Shipped" time="4 March" dateTime="2026-03-04">
        <Text size="body-sm" tone="soft">
          Left the warehouse in the morning.
        </Text>
      </TimelineItem>
      <TimelineItem tone="success" title="Delivered" time="To be confirmed" />
    </Timeline>
  ),
};
export default meta;

type Story = StoryObj<typeof Timeline>;

// An ordered list whose items stay `li`, each with a machine-readable time.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list');
    await expect(list.tagName).toBe('OL');
    await expect(list).toHaveAttribute('role', 'list');
    const items = within(list).getAllByRole('listitem');
    await expect(items).toHaveLength(4);
    await expect(items[0]).toHaveTextContent('Order placed 2 March');
    await expect(items[0].querySelector('time')).toHaveAttribute(
      'dateTime',
      '2026-03-02',
    );
    // An unknown date has no machine value, so it is not a <time>.
    await expect(items[3].querySelector('time')).toBeNull();
  },
};

export const WithRail: Story = { args: { rail: true, gap: 4 } };

export const Tones: Story = {
  render: (args) => (
    <Timeline {...args}>
      {(['neutral', 'accent', 'success', 'warning', 'danger'] as const).map(
        (tone) => (
          <TimelineItem key={tone} tone={tone} title={tone} time="Today" />
        ),
      )}
    </Timeline>
  ),
};

// Without `title` or `time` an item renders its children as they are, so an
// entry can carry its own heading and controls; the rail marks the steps.
export const ComposedEntries: Story = {
  args: { marker: 'none', rail: true, gap: 0 },
  render: (args) => (
    <Timeline {...args}>
      {['Request opened', 'Request reviewed'].map((step) => (
        <TimelineItem key={step} style={{ paddingBlock: 'var(--ds-space-4)' }}>
          <Heading level={3} size="body-sm" weight="semibold">
            {step}
          </Heading>
          <Text size="body-sm" tone="soft">
            <time dateTime="2026-03-02T10:00">2 March, 10:00</time>
          </Text>
          <Button variant="secondary" size="sm">
            Correct
          </Button>
        </TimelineItem>
      ))}
    </Timeline>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(2);
    const [first] = canvas.getAllByRole('button', { name: 'Correct' });
    first.focus();
    await expect(first).toHaveFocus();
  },
};
