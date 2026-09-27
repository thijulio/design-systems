import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Card } from '@thijulio/exodus-react';

const meta: Meta<typeof Card> = {
  title: 'Exodus/Core/Card',
  component: Card,
  args: {
    pad: true,
    children:
      'The standard white surface — stone border, lg radius, elevation.',
  },
  argTypes: {
    pad: {
      control: 'boolean',
      description: 'Apply the default 18/20 padding.',
    },
    interactive: {
      control: 'boolean',
      description: 'Add the hover-lift used by clickable cards.',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 340 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByText(/standard white surface/i);
    const style = getComputedStyle(card);
    await expect(style.backgroundColor).toBe('rgb(255, 255, 255)');
    await expect(style.borderColor).toBe('rgb(227, 224, 217)');
    await expect(style.borderRadius).toBe('12px');
    await expect(style.paddingTop).toBe('18px');
    await expect(style.paddingLeft).toBe('20px');
  },
};
export const Interactive: Story = { args: { interactive: true } };
