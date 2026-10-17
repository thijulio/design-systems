import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Icon, IconButton, Inline } from '@thijulio/primitives';

const meta: Meta<typeof IconButton> = {
  title: 'Components/IconButton',
  component: IconButton,
  args: {
    label: 'Edit',
    icon: <Icon name="edit" size={18} />,
    onClick: fn(),
  },
  argTypes: {
    label: {
      description: 'Accessible name (aria-label); required, no visible text.',
    },
    icon: {
      control: false,
      description: 'The glyph, usually an Icon; hidden from assistive tech.',
    },
    variant: {
      control: 'inline-radio',
      options: ['ghost', 'secondary', 'primary', 'danger'],
      description: 'Visual weight of the action.',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Square hit area.',
    },
    isLoading: {
      description:
        'Busy: sets aria-busy/aria-disabled and swallows clicks, keeping focus.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof IconButton>;

// Named by `label`; reachable with Tab and activated with Enter or Space.
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Edit' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

const VARIANTS = [
  { variant: 'ghost', label: 'Search', icon: 'search' },
  { variant: 'secondary', label: 'Filter', icon: 'filter' },
  { variant: 'primary', label: 'Add', icon: 'plus' },
  { variant: 'danger', label: 'Delete', icon: 'trash' },
] as const;

export const Variants: Story = {
  render: (args) => (
    <Inline gap={2} align="center">
      {VARIANTS.map(({ variant, label, icon }) => (
        <IconButton
          key={variant}
          {...args}
          variant={variant}
          label={label}
          icon={<Icon name={icon} size={18} />}
        />
      ))}
    </Inline>
  ),
};

const SIZES = [
  { size: 'sm', label: 'Settings, small', glyph: 16 },
  { size: 'md', label: 'Settings, medium', glyph: 18 },
  { size: 'lg', label: 'Settings, large', glyph: 22 },
] as const;

export const Sizes: Story = {
  args: { variant: 'secondary' },
  render: (args) => (
    <Inline gap={2} align="center">
      {SIZES.map(({ size, label, glyph }) => (
        <IconButton
          key={size}
          {...args}
          size={size}
          label={label}
          icon={<Icon name="settings" size={glyph} />}
        />
      ))}
    </Inline>
  ),
};

// Busy, not disabled: it stays focusable and announces aria-busy.
export const Loading: Story = {
  args: { variant: 'secondary', label: 'Download', isLoading: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Download',
    });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
