import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { MultiSelect, type MultiSelectOption } from '@thijulio/primitives';

const options: MultiSelectOption[] = [
  { value: 'short', label: 'Short coat' },
  { value: 'medium', label: 'Medium coat' },
  { value: 'long', label: 'Long coat' },
  { value: 'wire', label: 'Wire' },
];

const summarise = (labels: string[]) =>
  labels.length <= 2
    ? labels.join(', ')
    : `${labels.slice(0, 2).join(', ')} +${labels.length - 2} more`;

const Stateful = ({ initial = [] as string[] }) => {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <div style={{ maxWidth: 320 }}>
      <MultiSelect
        label="Coat types"
        hint="Choose every coat you like"
        placeholder="Select coats"
        doneLabel="Done"
        options={options}
        value={value}
        onChange={setValue}
        formatSummary={summarise}
      />
    </div>
  );
};

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  argTypes: {
    placeholder: { description: 'Trigger text with no selection (no default copy).' },
    doneLabel: { description: 'Close button text (no default copy).' },
    formatSummary: {
      description: 'Trigger text for a selection, given the selected labels.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof MultiSelect>;

export const Default: Story = {
  render: () => <Stateful />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Coat types' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Select coats' }));
    await userEvent.click(canvas.getByLabelText('Wire'));
    await expect(canvas.getByRole('button', { name: 'Wire' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  },
};

export const Preselected: Story = {
  render: () => <Stateful initial={['short', 'long', 'wire']} />,
};
