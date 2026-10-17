import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  Button,
  HoneypotField,
  Input,
  Stack,
  Text,
  type HoneypotFieldProps,
} from '@thijulio/primitives';

// A small form with the trap between two real controls. The value line
// stands in for the server check: a person always leaves it empty.
function Demo(args: HoneypotFieldProps) {
  const [value, setValue] = useState('');
  return (
    <form aria-label="Contact" onSubmit={(event) => event.preventDefault()}>
      <Stack gap={3} align="start">
        <Input aria-label="Email" name="email" type="email" />
        <HoneypotField
          {...args}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          data-testid="trap"
        />
        <Button type="submit">Send</Button>
        <Text size="caption" tone="soft">
          {value ? `Trap value: ${value}` : 'Trap is empty'}
        </Text>
      </Stack>
    </form>
  );
}

const meta: Meta<typeof HoneypotField> = {
  title: 'Components/HoneypotField',
  component: HoneypotField,
  args: { name: 'website', label: 'Website' },
  argTypes: {
    name: {
      control: 'text',
      description: 'Field name the server checks; a value marks a bot.',
    },
    label: {
      control: 'text',
      description:
        'Label text for bots. Required: there is no default copy. ' +
        'People never see or hear it.',
    },
    wrapperClassName: {
      control: false,
      description: 'Class for the root; `className` lands on the input.',
    },
  },
  render: (args) => <Demo {...args} />,
};
export default meta;

type Story = StoryObj<typeof HoneypotField>;

// Tab goes from the email field straight to the button, and the trap has no
// accessible role. A bot filling it by script still reaches the onChange.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trap = canvas.getByTestId('trap');
    await expect(trap).toHaveAttribute('tabindex', '-1');
    await expect(trap).toHaveAttribute('autocomplete', 'off');
    await expect(trap.parentElement).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getAllByRole('textbox')).toHaveLength(1);

    await userEvent.click(canvas.getByRole('textbox', { name: 'Email' }));
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Send' })).toHaveFocus();
    await expect(canvas.getByText('Trap is empty')).toBeInTheDocument();

    await userEvent.type(trap, 'bot');
    await expect(canvas.getByText('Trap value: bot')).toBeInTheDocument();
  },
};
