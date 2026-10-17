import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  Inline,
  ToggleButton,
  type ToggleButtonShape,
} from '@thijulio/primitives';

const Stateful = ({
  label,
  initial = false,
  shape,
}: {
  label: string;
  initial?: boolean;
  shape?: ToggleButtonShape;
}) => {
  const [pressed, setPressed] = useState(initial);
  return (
    <ToggleButton
      pressed={pressed}
      onPressedChange={setPressed}
      shape={shape}
      size={shape === 'pill' ? 'sm' : undefined}
    >
      {label}
    </ToggleButton>
  );
};

const meta: Meta<typeof ToggleButton> = {
  title: 'Components/ToggleButton',
  component: ToggleButton,
  args: { pressed: false, children: 'Follow topic' },
  argTypes: {
    pressed: { description: 'Current on/off state (aria-pressed).' },
    onPressedChange: {
      description: 'Called with the next state, unless onClick prevented it.',
    },
    shape: {
      control: 'inline-radio',
      options: ['default', 'pill'],
      description:
        'default keeps the control radius; pill rounds it fully, for chips.',
    },
    variant: {
      description:
        'Unset, it reads secondary when off and soft when on. A fixed variant overrides both.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof ToggleButton>;

// One button whose name stays the same; the state is aria-pressed. Enter and
// Space toggle it like a click.
export const Default: Story = {
  render: () => <Stateful label="Follow topic" />,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Follow topic',
    });
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  },
};

export const Pressed: Story = {
  render: () => <Stateful label="Follow topic" initial />,
};

// Filter chips: pill toggles in a named group. Each chip keeps its own state,
// and Tab moves between them in order.
export const PillChips: Story = {
  render: () => (
    <Inline gap={2} wrap role="group" aria-label="Filter by colour">
      <Stateful label="Red" shape="pill" initial />
      <Stateful label="Green" shape="pill" />
      <Stateful label="Blue" shape="pill" />
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', {
      name: 'Filter by colour',
    });
    const red = within(group).getByRole('button', { name: 'Red' });
    const green = within(group).getByRole('button', { name: 'Green' });
    await expect(red).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(red);
    await userEvent.tab();
    await expect(green).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(green).toHaveAttribute('aria-pressed', 'true');
    await expect(red).toHaveAttribute('aria-pressed', 'false');
  },
};

// Independent toggles in a named group: each keeps its own state.
export const Group: Story = {
  render: () => (
    <Inline gap={2} role="group" aria-label="Text formatting">
      <Stateful label="Bold" initial />
      <Stateful label="Italic" />
      <Stateful label="Underline" />
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', {
      name: 'Text formatting',
    });
    await userEvent.click(
      within(group).getByRole('button', { name: 'Italic' }),
    );
    await expect(
      within(group).getByRole('button', { name: 'Bold' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      within(group).getByRole('button', { name: 'Italic' }),
    ).toHaveAttribute('aria-pressed', 'true');
  },
};

export const Disabled: Story = {
  render: () => (
    <ToggleButton pressed={false} disabled>
      Follow topic
    </ToggleButton>
  ),
};
