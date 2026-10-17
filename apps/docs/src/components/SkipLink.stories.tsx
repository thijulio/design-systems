import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, SkipLink, Stack, Text } from '@thijulio/primitives';

const meta: Meta<typeof SkipLink> = {
  title: 'Components/SkipLink',
  component: SkipLink,
  args: { href: '#story-main', label: 'Skip to main content' },
  argTypes: {
    href: {
      control: 'text',
      description: 'Fragment of the landmark to jump to.',
    },
    label: {
      control: 'text',
      description: 'The link text. Required: there is no default copy.',
    },
  },
  // A miniature page shell: the skip link comes before the navigation.
  render: (args) => (
    <Stack gap={4}>
      <SkipLink {...args} />
      <nav aria-label="Example">
        <Stack gap={2}>
          <Button variant="secondary">Home</Button>
          <Button variant="secondary">Settings</Button>
        </Stack>
      </nav>
      <main id="story-main">
        <Text>Main content starts here.</Text>
      </main>
    </Stack>
  ),
};
export default meta;

type Story = StoryObj<typeof SkipLink>;

// Tab into the canvas to reveal the pill; Enter moves focus past the nav.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Skip to main content' });
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('main')).toHaveFocus();
  },
};

// The target already takes programmatic focus, so it is left untouched.
export const FocusableTarget: Story = {
  args: { href: '#story-main-focusable' },
  render: (args) => (
    <Stack gap={4}>
      <SkipLink {...args} />
      <Button variant="secondary">Menu</Button>
      <main id="story-main-focusable" tabIndex={-1}>
        <Text>Main content starts here.</Text>
      </main>
    </Stack>
  ),
};
