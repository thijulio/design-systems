import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  Button,
  LiveRegion,
  Stack,
  type LiveRegionProps,
} from '@thijulio/primitives';

// The region is mounted empty and only its text changes: a screen reader
// observes a region that already exists, not one mounted with its text.
function Demo(args: LiveRegionProps) {
  const [count, setCount] = useState(0);
  return (
    <Stack gap={3} align="start">
      <Button variant="secondary" onClick={() => setCount((n) => n + 6)}>
        Load more
      </Button>
      <LiveRegion {...args} data-testid="region">
        {count > 0 ? `Showing ${count} of 24 results` : ''}
      </LiveRegion>
    </Stack>
  );
}

const meta: Meta<typeof LiveRegion> = {
  title: 'Components/LiveRegion',
  component: LiveRegion,
  argTypes: {
    politeness: {
      control: 'inline-radio',
      options: ['polite', 'assertive'],
      description: 'polite → role="status", assertive → role="alert".',
    },
    visuallyHidden: {
      description: 'Clip the region for assistive technology only.',
    },
    atomic: { description: 'Sets aria-atomic.' },
  },
  args: { politeness: 'polite', visuallyHidden: true },
  render: (args) => <Demo {...args} />,
};
export default meta;

type Story = StoryObj<typeof LiveRegion>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('status');
    await expect(region).toHaveAttribute('aria-live', 'polite');
    await expect(region).toBeEmptyDOMElement();
    await userEvent.click(canvas.getByRole('button', { name: 'Load more' }));
    await expect(canvas.getByTestId('region')).toBe(region);
    await expect(region).toHaveTextContent('Showing 6 of 24 results');
  },
};

// Shown on screen so the changing text is visible while reviewing.
export const Visible: Story = {
  args: { visuallyHidden: false, atomic: true },
};

export const Assertive: Story = {
  args: { politeness: 'assertive', visuallyHidden: false },
};
