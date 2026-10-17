import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { RadioGroup, type RadioOption } from '@thijulio/primitives';

const options: RadioOption[] = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'post', label: 'Post', disabled: true },
];

const cardOptions: RadioOption[] = [
  {
    value: 'visit',
    label: 'Visit',
    description: 'Meet in person at a time that suits you.',
    labelTestId: 'choice-visit',
  },
  {
    value: 'call',
    label: 'Call',
    description: 'Talk it through on the phone first.',
    labelTestId: 'choice-call',
  },
  {
    value: 'later',
    label: 'Later',
    description: 'Not available right now.',
    disabled: true,
  },
];

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: { name: 'contact', legend: 'Contact by', options },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
    },
    variant: {
      control: 'inline-radio',
      options: ['default', 'card'],
      description:
        '`card` makes each whole option a bordered click target and ' +
        'highlights the checked one.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  args: { defaultValue: 'email' },
};

export const Horizontal: Story = {
  args: { orientation: 'horizontal', defaultValue: 'phone' },
};

// Nothing preselected: the reader must choose. A click anywhere on a card,
// description included, selects its radio.
export const Card: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <RadioGroup
        name="choice"
        legend="How would you like to start?"
        hint="You can change this later."
        variant="card"
        options={cardOptions}
        value={value}
        onChange={setValue}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const visit = canvas.getByRole('radio', { name: 'Visit' });
    await expect(visit).not.toBeChecked();
    await expect(visit).toHaveAccessibleDescription(
      'Meet in person at a time that suits you.',
    );
    await userEvent.click(
      canvas.getByText('Meet in person at a time that suits you.'),
    );
    await expect(visit).toBeChecked();
    await expect(canvas.getByTestId('choice-visit')).toContainElement(visit);
  },
};

export const CardWithError: Story = {
  args: {
    variant: 'card',
    options: cardOptions,
    legend: 'How would you like to start?',
    error: 'Choose one to continue.',
  },
};
