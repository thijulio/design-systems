import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '@thijulio/biome-react';

const meta: Meta<typeof Button> = {
  title: 'Biome/Components/Button',
  component: Button,
  args: { children: 'Grow software' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost'],
      description:
        'Visual weight. primary = filled mata; secondary = outline; ghost = text-only warm.',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Control size.',
    },
    href: {
      control: 'text',
      description:
        'Render as an anchor instead of a button. Ignored when disabled.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Interactive: Story = {
  args: { onClick: fn() },
  // Interaction test: clicking invokes the consumer callback once.
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Grow software' }),
    );
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Large: Story = { args: { size: 'lg' } };
export const Disabled: Story = {
  args: { disabled: true, onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Grow software' });
    await expect(button).toBeDisabled();
    button.click();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const Dark: Story = {
  globals: { mode: 'dark' },
  // Scope dark mode on the story itself too: the `mode` global only reaches
  // <html> through the toolbar decorator, which docs pages and compiled
  // previews (design-sync) don't run. biome.css keys dark tokens on any
  // [data-mode="dark"] ancestor.
  decorators: [
    (Story) => (
      <div
        data-mode="dark"
        style={{ background: 'var(--surface-page)', padding: 'var(--space-4)' }}
      >
        <Story />
      </div>
    ),
  ],
};
