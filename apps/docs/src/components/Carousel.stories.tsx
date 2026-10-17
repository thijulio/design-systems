import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  Card,
  Carousel,
  Grid,
  Link,
  Text,
  type CarouselProps,
} from '@thijulio/primitives';

const NAMES = ['Ada', 'Bram', 'Cleo', 'Dax', 'Edie', 'Finn', 'Gus', 'Hana'];

function Slide({ name }: { name: string }) {
  return (
    <Card padding="sm" style={{ inlineSize: '12rem' }}>
      <Link href={`#${name.toLowerCase()}`}>{name}</Link>
    </Card>
  );
}

const meta: Meta<typeof Carousel> = {
  title: 'Components/Carousel',
  component: Carousel,
  args: { previousLabel: 'Previous items', nextLabel: 'Next items' },
  argTypes: {
    previousLabel: { description: 'Accessible name. Required.' },
    nextLabel: { description: 'Accessible name. Required.' },
    gap: { control: 'select', options: [0, 2, 3, 4, 6] },
  },
};
export default meta;

type Story = StoryObj<typeof Carousel>;

// Scroll mode: the track scrolls by one view and the controls follow its
// edges.
export const Default: Story = {
  render: (args) => (
    <div style={{ maxInlineSize: '40rem' }}>
      <Carousel {...args}>
        {NAMES.map((name) => (
          <Slide key={name} name={name} />
        ))}
      </Carousel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // At the start edge: aria-disabled (it keeps focus), not native disabled.
    await expect(
      canvas.getByRole('button', { name: 'Previous items' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(
      canvas.getByRole('button', { name: 'Next items' }),
    ).not.toHaveAttribute('aria-disabled');
  },
};

// Paged mode: the caller owns the page and swaps the track content.
function PagedDemo(args: Partial<CarouselProps>) {
  const perPage = 4;
  const pages = Math.ceil(NAMES.length / perPage);
  const [page, setPage] = useState(0);
  const visible = NAMES.slice(page * perPage, (page + 1) * perPage);
  return (
    <Carousel
      previousLabel="Previous items"
      nextLabel="Next items"
      {...args}
      onPrevious={() => setPage((n) => Math.max(0, n - 1))}
      onNext={() => setPage((n) => Math.min(pages - 1, n + 1))}
      previousDisabled={page === 0}
      nextDisabled={page >= pages - 1}
      previousTestId="items-prev"
      nextTestId="items-next"
    >
      <Grid gap={3} columns={{ base: 1, sm: 2, xl: 4 }}>
        {visible.map((name) => (
          <Card key={name} padding="sm">
            <Text size="body-sm" weight="semibold">
              {name}
            </Text>
          </Card>
        ))}
      </Grid>
    </Carousel>
  );
}

export const Paged: Story = {
  render: (args) => <PagedDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('items-prev')).toBeDisabled();
    await expect(canvas.getByText('Ada')).toBeVisible();
    await userEvent.click(canvas.getByTestId('items-next'));
    await expect(canvas.getByText('Edie')).toBeVisible();
    await expect(canvas.queryByText('Ada')).toBeNull();
    await expect(canvas.getByTestId('items-next')).toBeDisabled();
  },
};
