import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  SegmentedControl,
  Text,
  type SegmentedControlOption,
} from '@thijulio/primitives';

const VIEWS: SegmentedControlOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const Stateful = ({
  initial = 'week',
  name,
}: {
  initial?: string;
  name?: string;
}) => {
  const [value, setValue] = useState(initial);
  return (
    <SegmentedControl
      label="Calendar view"
      options={VIEWS}
      value={value}
      onChange={setValue}
      name={name}
    />
  );
};

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  argTypes: {
    label: {
      description: 'Group name (aria-label); required, no visible label.',
    },
    options: { description: 'The choices: value, label, optional testId.' },
    value: { description: 'Selected option value (controlled).' },
    onChange: { description: 'Called with the chosen option value.' },
    name: {
      description: 'When set, a hidden input submits the value with a form.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof SegmentedControl>;

// Each option is a button in a named group; the selection is aria-pressed,
// not colour alone. Every option is a Tab stop, chosen with Enter or Space.
export const Default: Story = {
  render: () => <Stateful />,
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', {
      name: 'Calendar view',
    });
    const day = within(group).getByRole('button', { name: 'Day' });
    const week = within(group).getByRole('button', { name: 'Week' });
    const month = within(group).getByRole('button', { name: 'Month' });
    await expect(week).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(month);
    await expect(month).toHaveAttribute('aria-pressed', 'true');
    await expect(week).toHaveAttribute('aria-pressed', 'false');

    day.focus();
    await userEvent.keyboard('{Enter}');
    await expect(day).toHaveAttribute('aria-pressed', 'true');
    await userEvent.tab();
    await expect(week).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(week).toHaveAttribute('aria-pressed', 'true');
  },
};

// With `name`, a hidden input carries the value into a form submission.
export const InForm: Story = {
  render: () => (
    <form aria-label="Calendar settings" onSubmit={(e) => e.preventDefault()}>
      <Stateful name="view" initial="day" />
      <Text size="caption" tone="soft">
        The selected view is submitted as “view”.
      </Text>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const form = within(canvasElement).getByRole('form', {
      name: 'Calendar settings',
    }) as HTMLFormElement;
    await userEvent.click(within(form).getByRole('button', { name: 'Month' }));
    await expect(new FormData(form).get('view')).toBe('month');
  },
};
