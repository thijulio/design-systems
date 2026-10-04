import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '@thijulio/exodus-react';

const meta: Meta<typeof Button> = {
  title: 'Exodus/Components/Button',
  component: Button,
  args: { children: 'Save changes' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: [
        'primary',
        'secondary',
        'soft',
        'ghost',
        'danger',
        'danger-outline',
      ],
      description:
        'Six intents. Accent-driven ones reskin per theme; danger stays fixed.',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Control size.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Interactive: Story = {
  args: { onClick: fn() },
  // Interaction test: clicking fires onClick exactly once.
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: /save changes/i }),
    );
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Soft: Story = { args: { variant: 'soft' } };
export const Danger: Story = {
  args: { variant: 'danger', children: 'Delete' },
};
export const Disabled: Story = {
  args: { disabled: true, onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Save changes' });
    await expect(button).toBeDisabled();
    button.click();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
// Scope the accent on the story itself too: the `accent` global only reaches
// <html> through the toolbar decorator, which docs pages and compiled
// previews (design-sync) don't run. exodus.css keys accent themes on any
// [data-theme] ancestor.
const withAccent =
  (theme: 'clay' | 'harbor'): Decorator =>
  (Story) => (
    <div data-theme={theme}>
      <Story />
    </div>
  );

export const Clay: Story = {
  globals: { accent: 'clay' },
  decorators: [withAccent('clay')],
};
export const Harbor: Story = {
  globals: { accent: 'harbor' },
  decorators: [withAccent('harbor')],
};
