import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { Inline, Tag } from '@thijulio/primitives';

const meta: Meta<typeof Tag> = {
  title: 'Components/Tag',
  component: Tag,
  args: { children: 'Design' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['outline', 'solid', 'muted'],
      description: 'outline (default), solid brand, or muted.',
    },
    status: {
      description:
        'Show a pulsing status dot before the label; it is decorative.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Tag>;

// A static label, not a control: no role, no tab stop.
export const Outline: Story = {
  play: async ({ canvasElement }) => {
    const tag = within(canvasElement).getByText('Design');
    await expect(tag.tagName).toBe('SPAN');
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

export const Solid: Story = { args: { variant: 'solid' } };

export const Muted: Story = { args: { variant: 'muted', children: 'Draft' } };

// The dot is aria-hidden, so the accessible text is the label alone.
export const WithStatus: Story = {
  args: { status: true, children: 'Available' },
  play: async ({ canvasElement }) => {
    const tag = within(canvasElement).getByText('Available');
    const dot = tag.querySelector('span[aria-hidden="true"]');
    if (!(dot instanceof HTMLElement)) throw new Error('Status dot is missing');
    await expect(tag).toHaveTextContent(/^Available$/);
    // The dot pulses, unless the viewer asked for reduced motion.
    const reducedMotion = matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    await waitFor(() =>
      expect(dot.getAnimations()).toHaveLength(reducedMotion ? 0 : 1),
    );
  },
};

export const Row: Story = {
  render: () => (
    <Inline gap={2} wrap>
      <Tag>Design</Tag>
      <Tag variant="solid">Research</Tag>
      <Tag variant="muted">Draft</Tag>
    </Inline>
  ),
};
