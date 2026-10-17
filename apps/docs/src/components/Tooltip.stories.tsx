import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Icon, Inline, Link, Tooltip } from '@thijulio/primitives';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  argTypes: {
    content: { description: 'Tooltip text; no default copy.' },
    placement: {
      control: 'inline-radio',
      options: ['top', 'bottom'],
      description: 'Side of the trigger it opens on (default top).',
    },
    relation: {
      control: 'inline-radio',
      options: ['description', 'label'],
      description:
        'description → aria-describedby; label → aria-labelledby, for an ' +
        'icon-only trigger named by the tooltip.',
    },
    asChild: {
      description: 'Make the single focusable child the trigger.',
    },
  },
  args: { placement: 'top', relation: 'description' },
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--ds-space-12)' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

/** A described trigger: hover or focus it, Escape dismisses. */
export const Default: Story = {
  args: {
    content: 'Shown on your public profile',
    'aria-label': 'About visibility',
    children: <Icon name="info" size={18} />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: 'About visibility',
    });
    // Closed, the tooltip is `visibility: hidden`, so it is out of the
    // accessibility tree until the trigger is focused.
    const tooltip = canvas.getByRole('tooltip', { hidden: true });
    await expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(tooltip).toHaveAttribute('data-state', 'open');
    await userEvent.keyboard('{Escape}');
    await expect(tooltip).toHaveAttribute('data-state', 'closed');
  },
};

/** An icon-only badge named by its tooltip, opening below. */
export const LabelsIconTrigger: Story = {
  args: {
    content: 'Verified',
    relation: 'label',
    placement: 'bottom',
    children: <Icon name="check" size={16} />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Verified' }),
    ).toBeInTheDocument();
  },
};

/** `asChild` puts the behaviour on an existing focusable element. */
export const AsChild: Story = {
  render: (args) => (
    <Inline gap={2}>
      <Tooltip {...args} asChild>
        <Link href="#terms">Terms</Link>
      </Tooltip>
    </Inline>
  ),
  args: { content: 'Last updated in March' },
};
