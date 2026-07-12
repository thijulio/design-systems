import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '@thijulio/exodus-react';

const meta: Meta<typeof Button> = {
  title: 'Exodus/Core/Button',
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

export const Primary: Story = {
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
