import { useId } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Fieldset, Input, Stack } from '@thijulio/primitives';

// The primitives have no Checkbox or labelled field: native controls with a
// native label stand in, so the group semantics are what is on show.
const Choice = ({
  value,
  label,
  defaultChecked,
}: {
  value: string;
  label: string;
  defaultChecked?: boolean;
}) => (
  <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <input
      type="checkbox"
      name="channel"
      value={value}
      defaultChecked={defaultChecked}
    />
    {label}
  </label>
);

const TextField = ({
  label,
  name,
  autoComplete,
}: {
  label: string;
  name: string;
  autoComplete: string;
}) => {
  const id = useId();
  return (
    <Stack gap={2}>
      <label htmlFor={id}>{label}</label>
      <Input id={id} name={name} autoComplete={autoComplete} />
    </Stack>
  );
};

const meta: Meta<typeof Fieldset> = {
  title: 'Components/Fieldset',
  component: Fieldset,
  args: {
    legend: 'Notifications',
    hint: 'Choose how we contact you about your account.',
  },
  argTypes: {
    legend: { description: 'Group label; required, it names the group.' },
    hint: { description: 'Help text under the legend; describes the group.' },
    error: {
      description:
        'Error text (role="alert"); describes the group and marks it invalid.',
    },
    legendHidden: {
      description: 'Keep the legend for assistive technology only.',
    },
    disabled: { description: 'Native: disables every control in the group.' },
  },
  render: (args) => (
    <Fieldset {...args}>
      <Stack gap={2}>
        <Choice value="email" label="Email" defaultChecked />
        <Choice value="sms" label="Text message" />
        <Choice value="push" label="Push notification" />
      </Stack>
    </Fieldset>
  ),
};
export default meta;

type Story = StoryObj<typeof Fieldset>;

// The legend names the group and the hint describes it, so a screen reader
// reads both when focus enters the first checkbox.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Notifications' });
    await expect(group).toHaveAccessibleDescription(
      'Choose how we contact you about your account.',
    );
    await userEvent.tab();
    await expect(
      within(group).getByRole('checkbox', { name: 'Email' }),
    ).toHaveFocus();
  },
};

export const WithError: Story = {
  args: { error: 'Choose at least one channel.' },
  render: (args) => (
    <Fieldset {...args}>
      <Stack gap={2}>
        <Choice value="email" label="Email" />
        <Choice value="sms" label="Text message" />
        <Choice value="push" label="Push notification" />
      </Stack>
    </Fieldset>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Notifications' });
    await expect(group).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Choose at least one channel.',
    );
    await expect(group).toHaveAccessibleDescription(
      /Choose at least one channel\./,
    );
  },
};

// The legend still names the group for assistive technology.
export const LegendHidden: Story = {
  args: { legend: 'Delivery address', hint: undefined, legendHidden: true },
  render: (args) => (
    <Fieldset {...args}>
      <Stack gap={3}>
        <TextField label="Street" name="street" autoComplete="street-address" />
        <TextField label="City" name="city" autoComplete="address-level2" />
        <TextField
          label="Postcode"
          name="postcode"
          autoComplete="postal-code"
        />
      </Stack>
    </Fieldset>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('group', { name: 'Delivery address' }),
    ).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const boxes = within(canvasElement).getAllByRole('checkbox');
    for (const box of boxes) await expect(box).toBeDisabled();
  },
};
