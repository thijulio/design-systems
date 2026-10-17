import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  Button,
  Dialog,
  Inline,
  Stack,
  Text,
  ThemeScope,
  useThemeScope,
} from '@thijulio/primitives';

// Theme names are the brand's; `harbor` and `clay` are Exodus accent themes.
// In a brand without them the attributes are set but change nothing.

const meta: Meta<typeof ThemeScope> = {
  title: 'Components/ThemeScope',
  component: ThemeScope,
  argTypes: {
    theme: {
      control: 'text',
      description:
        'Theme name, set as data-theme. Unset, the theme of the enclosing ' +
        'scope is passed on and no attribute is set.',
    },
    mode: {
      control: 'text',
      description: 'Colour mode (e.g. dark), set as data-mode.',
    },
    as: { description: 'Element to render; defaults to div.' },
    asChild: {
      description:
        'Put the attributes, props and ref on the single child instead of ' +
        'a wrapper.',
    },
  },
  args: { theme: 'harbor' },
};
export default meta;

type Story = StoryObj<typeof ThemeScope>;

// What the React tree below a scope reads.
const ScopeReadout = () => {
  const { theme, mode } = useThemeScope();
  return (
    <Text size="body-sm" tone="soft">
      Theme: {theme ?? 'none'}, mode: {mode ?? 'none'}
    </Text>
  );
};

export const Default: Story = {
  render: (args) => (
    <ThemeScope {...args} data-testid="scope">
      <Stack gap={3} align="start">
        <ScopeReadout />
        <Button>Save changes</Button>
      </Stack>
    </ThemeScope>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('scope')).toHaveAttribute(
      'data-theme',
      'harbor',
    );
    await expect(canvas.getByText('Theme: harbor, mode: none')).toBeVisible();
  },
};

// The inner scope overrides the theme. (A mode is passed on the same way; it
// is left out here because a dark mode on a light page fails contrast.)
export const Nested: Story = {
  render: (args) => (
    <ThemeScope {...args}>
      <Stack gap={4} align="start">
        <ScopeReadout />
        <ThemeScope theme="clay" data-testid="inner">
          <Stack gap={3} align="start">
            <ScopeReadout />
            <Button>Save changes</Button>
          </Stack>
        </ThemeScope>
      </Stack>
    </ThemeScope>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('inner')).toHaveAttribute(
      'data-theme',
      'clay',
    );
    await expect(canvas.getByText('Theme: clay, mode: none')).toBeVisible();
  },
};

// No wrapper: the scope's attributes land on the section itself.
export const AsChild: Story = {
  args: { asChild: true },
  render: (args) => (
    <ThemeScope {...args}>
      <section aria-label="Account">
        <Button>Save changes</Button>
      </section>
    </ThemeScope>
  ),
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole('region', {
      name: 'Account',
    });
    await expect(region).toHaveAttribute('data-theme', 'harbor');
  },
};

const PromptOnLoad = () => {
  const [open, setOpen] = useState(true);
  const close = () => setOpen(false);
  return (
    <Dialog
      open={open}
      onClose={close}
      size="sm"
      title="Welcome back"
      description="Your changes were saved while you were away."
      closeLabel="Close"
      footer={
        <Inline gap={2} justify="end">
          <Button onClick={close}>Continue</Button>
        </Inline>
      }
    >
      <Text>Pick up where you left off.</Text>
    </Dialog>
  );
};

// A dialog that opens on load has no focused opener to read a theme from.
// It is portalled out of the scope's element but takes the scope's theme
// from React. Escape still closes it.
export const PortalledDialog: Story = {
  render: (args) => (
    <ThemeScope {...args}>
      <PromptOnLoad />
    </ThemeScope>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole('dialog', { name: 'Welcome back' });
    await expect(canvasElement).not.toContainElement(dialog);
    await expect(dialog).toHaveAttribute('data-theme', 'harbor');
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
  },
};
