import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox } from '@thijulio/exodus-react';

const meta: Meta<typeof Checkbox> = {
  title: 'Exodus/Components/Checkbox',
  component: Checkbox,
  argTypes: {
    label: { description: 'Label rendered beside the box.' },
    description: {
      description:
        'Secondary text under the label. Describes the input ' +
        '(`aria-describedby`) and stays out of its accessible name.',
    },
    align: {
      control: 'inline-radio',
      options: ['center', 'start'],
      description:
        'Box position: `center` for one line, `start` to hold it at the ' +
        'top of a label that wraps.',
    },
    labelTestId: { description: '`data-testid` for the root `<label>`.' },
  },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: { checked: true, label: 'Vaccinated', readOnly: true },
};
export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <Checkbox
        checked={checked}
        label="Vaccinated"
        onChange={(e) => setChecked(e.target.checked)}
      />
    );
  },
  // Interaction test: the native control remains keyboard-operable.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox');
    await expect(box).toBeChecked();
    box.focus();
    await userEvent.keyboard(' ');
    await expect(box).not.toBeChecked();
  },
};

/** Uncontrolled: the box follows the native input, not a prop. */
export const Uncontrolled: Story = {
  args: { defaultChecked: true, label: 'Microchipped' },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox', {
      name: 'Microchipped',
    });
    await expect(box).toBeChecked();
    await userEvent.click(box);
    await expect(box).not.toBeChecked();
  },
};

/** A description under the label: it describes the box, not names it. */
export const WithDescription: Story = {
  args: {
    label: 'I agree to be contacted about this request',
    description: 'Your details are kept for twelve months, then deleted.',
    align: 'start',
  },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox', {
      name: 'I agree to be contacted about this request',
    });
    await expect(box).toHaveAccessibleDescription(
      'Your details are kept for twelve months, then deleted.',
    );
    await expect(box).not.toBeChecked();
    box.focus();
    await userEvent.keyboard(' ');
    await expect(box).toBeChecked();
  },
};

/** `align="start"`: the box stays on the first line of a wrapping label. */
export const AlignStart: Story = {
  args: {
    align: 'start',
    label:
      'I confirm that the information I have given is accurate and that ' +
      'I may be contacted to follow up on it.',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};
