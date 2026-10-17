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
        'link',
      ],
      description:
        'Seven intents. Accent-driven ones reskin per theme; danger stays fixed.',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Control size.',
    },
    isLoading: {
      control: 'boolean',
      description:
        'In flight: spinner, aria-busy + aria-disabled, press refused; never native disabled.',
    },
    loadingLabel: {
      description: 'Visually hidden text announced while loading.',
    },
    asChild: {
      description:
        'Render the single child (e.g. a router link) with the Button styles.',
    },
    fullWidth: { control: 'boolean', description: 'Stretch to the container.' },
    href: { description: 'Render an anchor (target/rel/download typed).' },
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
export const Link: Story = {
  args: { variant: 'link', children: 'Forgot password?' },
};
export const Loading: Story = {
  args: { isLoading: true, loadingLabel: 'Saving', onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: /save changes/i,
    });
    await expect(button).not.toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const AsChild: Story = {
  args: {
    asChild: true,
    variant: 'secondary',
    children: <a href="#adopt">Adopt Luna</a>,
  },
};
export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
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
