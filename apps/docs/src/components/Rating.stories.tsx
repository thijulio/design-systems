import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Rating, Stack } from '@thijulio/primitives';

const meta: Meta<typeof Rating> = {
  title: 'Components/Rating',
  component: Rating,
  args: { value: 4.5, label: 'Rated 4.5 out of 5' },
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 5, step: 0.5 },
      description: 'Score; clamped to 0..max and rounded down to a half star.',
    },
    max: { description: 'Number of stars (default 5).' },
    label: {
      description:
        'Accessible reading of the stars, e.g. a translated "4.5 out of 5". Required.',
    },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    valueText: {
      description: 'Visible figure after the stars, already locale-formatted.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Rating>;

// The stars are one image named by `label`; the visible figure stays text
// beside it rather than a hidden child of the image.
export const Default: Story = {
  args: { valueText: '4.5' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stars = canvas.getByRole('img', { name: 'Rated 4.5 out of 5' });
    await expect(
      stars.querySelectorAll('svg[aria-hidden="true"]'),
    ).toHaveLength(5);
    await expect(stars).not.toHaveTextContent('4.5');
    await expect(canvas.getByText('4.5')).toBeVisible();
  },
};

export const Small: Story = {
  args: { size: 'sm', value: 3, label: 'Rated 3 out of 5', valueText: '3.0' },
};

// 3.7 rounds down to 3.5; 0 shows five empty outlines.
export const Values: Story = {
  render: () => (
    <Stack gap={2}>
      <Rating value={5} label="Rated 5 out of 5" valueText="5.0" />
      <Rating value={3.7} label="Rated 3.7 out of 5" valueText="3.7" />
      <Rating value={2} label="Rated 2 out of 5" valueText="2.0" />
      <Rating value={0} label="Not rated yet" />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const images = within(canvasElement).getAllByRole('img');
    await expect(images).toHaveLength(4);
    const partial = within(canvasElement).getByRole('img', {
      name: 'Rated 3.7 out of 5',
    });
    await expect(partial.querySelectorAll('[data-fill="0.5"]')).toHaveLength(1);
  },
};

export const TenPointScale: Story = {
  args: { value: 7, max: 10, label: 'Rated 7 out of 10', valueText: '7/10' },
};
