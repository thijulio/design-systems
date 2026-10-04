import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '@thijulio/primitives';

const meta: Meta<typeof Button> = {
  title: 'Exodus/Migration/Primitives/Button',
  component: Button,
  args: { children: 'Save changes' },
  parameters: {
    docs: {
      description: {
        component:
          'The same @thijulio/primitives Button used by Faune, skinned by Exodus tokens. The existing @thijulio/exodus-react Button API remains available.',
      },
    },
  },
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
      description: 'Action intent, styled by the active Exodus theme.',
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

export const Sage: Story = {
  globals: { accent: 'sage' },
  args: { onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Save changes',
    });
    await waitFor(() =>
      expect(getComputedStyle(button).backgroundColor).toBe('rgb(61, 99, 68)'),
    );
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Clay: Story = {
  globals: { accent: 'clay' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Save changes',
    });
    await waitFor(() =>
      expect(getComputedStyle(button).backgroundColor).toBe('rgb(164, 74, 43)'),
    );
  },
};

export const Harbor: Story = {
  globals: { accent: 'harbor' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Save changes',
    });
    await waitFor(() =>
      expect(getComputedStyle(button).backgroundColor).toBe('rgb(42, 86, 136)'),
    );
  },
};

export const NestedThemes: Story = {
  globals: { accent: 'clay' },
  render: () => (
    <div data-theme="harbor" style={{ display: 'grid', gap: 16 }}>
      <Button>Harbor scope</Button>
      <div data-theme="sage">
        <Button>Sage scope</Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      getComputedStyle(canvas.getByRole('button', { name: 'Harbor scope' }))
        .backgroundColor,
    ).toBe('rgb(42, 86, 136)');
    await expect(
      getComputedStyle(canvas.getByRole('button', { name: 'Sage scope' }))
        .backgroundColor,
    ).toBe('rgb(61, 99, 68)');
  },
};
