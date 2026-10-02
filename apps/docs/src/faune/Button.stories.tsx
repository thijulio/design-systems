import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '@thijulio/faune-react';
import { contrastRatio } from '../_test/contrast';
import { hoverInBrowserTest } from '../_test/hover';

const meta: Meta<typeof Button> = {
  title: 'Faune/Components/Button',
  component: Button,
  args: { children: 'Réserver une visite' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: [
        'primary',
        'accent',
        'secondary',
        'soft',
        'ghost',
        'danger',
        'danger-outline',
      ],
      description: 'primary = brand (ink), accent = coral; the rest as named.',
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
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: /réserver une visite/i }),
    );
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const Accent: Story = {
  args: { variant: 'accent', children: 'Demander un devis' },
};
export const AccentHovered: Story = {
  ...Accent,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    if (!(await hoverInBrowserTest(button))) return;
    // Wait for the CSS color transition to settle, then check the actual pair.
    await waitFor(() =>
      expect(getComputedStyle(button).backgroundColor).toBe('rgb(191, 72, 51)'),
    );
    const style = getComputedStyle(button);
    await expect(
      contrastRatio(style.color, style.backgroundColor),
    ).toBeGreaterThanOrEqual(4.5);
  },
};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Soft: Story = { args: { variant: 'soft' } };
export const Danger: Story = {
  args: { variant: 'danger', children: 'Annuler' },
};
