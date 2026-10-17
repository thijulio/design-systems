import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  List,
  ListItem,
  LoadMore,
  Stack,
  type LoadMoreProps,
} from '@thijulio/primitives';

const TOTAL = 18;
const PAGE = 6;

// A list that grows one page per press after a short delay, so the busy
// button and the announced count can both be seen.
function Demo(args: LoadMoreProps) {
  const [shown, setShown] = useState(PAGE);
  const [loading, setLoading] = useState(false);
  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setShown((n) => Math.min(n + PAGE, TOTAL));
      setLoading(false);
    }, 300);
  };
  return (
    <Stack gap={4}>
      <List gap={1}>
        {Array.from({ length: shown }, (_, i) => (
          <ListItem key={i}>Result {i + 1}</ListItem>
        ))}
      </List>
      <LoadMore
        {...args}
        shown={shown}
        total={TOTAL}
        hasMore={shown < TOTAL}
        loading={loading}
        onLoadMore={loadMore}
      />
    </Stack>
  );
}

const meta: Meta<typeof LoadMore> = {
  title: 'Components/LoadMore',
  component: LoadMore,
  argTypes: {
    label: { description: 'Visible button label; no default copy.' },
    status: { description: 'Formats the live "x of y" status.' },
    loading: { description: 'A page is in flight: busy, press refused.' },
    failed: { description: 'The last page failed: kept, aria-disabled.' },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
    },
  },
  args: {
    label: 'Load more',
    status: (shown: number, total: number) => `Showing ${shown} of ${total}`,
    buttonVariant: 'secondary',
    statusTestId: 'status',
  },
  render: (args) => <Demo {...args} />,
};
export default meta;

type Story = StoryObj<typeof LoadMore>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('status');
    await expect(region).toHaveTextContent('Showing 6 of 18');
    const button = canvas.getByRole('button', { name: 'Load more' });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveFocus();
    await waitFor(() => expect(region).toHaveTextContent('Showing 12 of 18'));
    await expect(canvas.getByTestId('status')).toBe(region);
  },
};

// The page asked for failed: the button stays, unavailable, for a retry
// rendered elsewhere to recover.
export const Failed: Story = {
  args: { failed: true, onLoadMore: fn() },
  render: (args) => (
    <LoadMore {...args} shown={6} total={18} hasMore={false} />
  ),
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(button);
    await expect(args.onLoadMore).not.toHaveBeenCalled();
  },
};

// Walk to the end: the button goes, the same status node stays.
export const ToTheEnd: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('status');
    for (const shown of [12, 18]) {
      await userEvent.click(canvas.getByRole('button', { name: 'Load more' }));
      await waitFor(() =>
        expect(region).toHaveTextContent(`Showing ${shown} of 18`),
      );
    }
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvas.getByRole('status')).toBe(region);
  },
};
