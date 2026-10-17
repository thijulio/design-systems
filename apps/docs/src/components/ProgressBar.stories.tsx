import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, ProgressBar, Stack } from '@thijulio/primitives';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  args: { label: 'Upload progress', value: 40 },
  argTypes: {
    label: { description: 'Accessible name; no default copy.' },
    value: {
      control: { type: 'number', min: 0 },
      description:
        'Current value from 0 to `max`, clamped. Omit it for an ' +
        'indeterminate bar.',
    },
    max: { description: 'Upper bound (default 100).' },
    formatValue: {
      control: false,
      description:
        'Formats the value: shown beside the bar and announced as ' +
        '`aria-valuetext`. Not called while indeterminate.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof ProgressBar>;

// The bar is not focusable: Tab moves straight past it to the next control.
export const Default: Story = {
  render: (args) => (
    <Stack gap={3} align="start">
      <ProgressBar {...args} />
      <Button variant="secondary">Cancel</Button>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('progressbar', { name: 'Upload progress' });
    await expect(bar).toHaveAttribute('aria-valuenow', '40');
    await expect(bar).toHaveAttribute('aria-valuemax', '100');
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  },
};

/** The formatted value is shown beside the bar and read as its value. */
export const WithValueText: Story = {
  args: {
    label: 'Download',
    value: 3,
    max: 12,
    formatValue: (value, max) => `${value} of ${max} MB`,
  },
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('progressbar', {
      name: 'Download',
    });
    await expect(bar).toHaveAttribute('aria-valuetext', '3 of 12 MB');
    await expect(bar).toHaveTextContent('3 of 12 MB');
  },
};

/** No value: work is under way but its extent is unknown. */
export const Indeterminate: Story = {
  args: { label: 'Preparing files', value: undefined },
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('progressbar', {
      name: 'Preparing files',
    });
    await expect(bar).not.toHaveAttribute('aria-valuenow');
  },
};

export const Complete: Story = { args: { value: 100 } };
