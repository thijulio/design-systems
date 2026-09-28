import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from '@thijulio/primitives';
import { expect, waitFor, within } from 'storybook/test';

const meta: Meta<typeof Tag> = {
  title: 'Faune/Components/Tag',
  component: Tag,
  args: { children: 'Visites' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['outline', 'solid', 'muted'],
      description: 'outline (default), solid brand, or muted.',
    },
    status: { description: 'Show a pulsing status dot before the label.' },
  },
};
export default meta;

type Story = StoryObj<typeof Tag>;

export const Outline: Story = {};
export const Solid: Story = { args: { variant: 'solid' } };
export const Muted: Story = { args: { variant: 'muted', children: 'chat' } };
export const WithStatus: Story = {
  args: { status: true, children: 'Disponible' },
  play: async ({ canvasElement }) => {
    const label = within(canvasElement).getByText('Disponible');
    const dot = label.querySelector('span[aria-hidden="true"]');
    if (!(dot instanceof HTMLElement)) throw new Error('Status dot is missing');
    const reducedMotion = matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    await waitFor(() =>
      expect(dot.getAnimations()).toHaveLength(reducedMotion ? 0 : 1),
    );
  },
};
