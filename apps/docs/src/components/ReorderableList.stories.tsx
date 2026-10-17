import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  ReorderableList,
  Text,
  type ReorderableListProps,
} from '@thijulio/primitives';

interface Task {
  id: string;
  name: string;
  detail: string;
}

const TASKS: Task[] = [
  { id: 'vet', name: 'Book the vet', detail: 'Annual check-up' },
  { id: 'food', name: 'Order food', detail: 'Two bags' },
  { id: 'walk', name: 'Plan the walk', detail: 'Saturday morning' },
];

type Props = ReorderableListProps<Task>;

// The caller owns the order: the list only asks for a move.
function Demo(args: Partial<Props>) {
  const [tasks, setTasks] = useState(TASKS);
  const onMove: Props['onMove'] = (_task, to, from) =>
    setTasks((all) => {
      const next = [...all];
      const [moving] = next.splice(from, 1);
      next.splice(to, 0, moving);
      return next;
    });
  return (
    <ReorderableList
      getKey={(task) => task.id}
      renderItem={(task) => task.name}
      moveUpLabel={(task) => `Move ${task.name} up`}
      moveDownLabel={(task) => `Move ${task.name} down`}
      announcement={(task, position, total) =>
        `${task.name} moved to position ${position} of ${total}`
      }
      aria-label="Tasks"
      {...args}
      items={tasks}
      onMove={onMove}
    />
  );
}

const meta: Meta<typeof ReorderableList<Task>> = {
  title: 'Components/ReorderableList',
  component: ReorderableList,
  argTypes: {
    as: {
      control: 'inline-radio',
      options: ['ol', 'ul'],
      description: '`ol` (default), since the order carries meaning.',
    },
    gap: { description: 'Space between items. Default 2.' },
    divided: { description: 'Draw a subtle rule between items.' },
    buttonSize: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the move controls. Default `sm`.',
    },
    buttonVariant: {
      control: 'inline-radio',
      options: ['ghost', 'secondary', 'primary', 'danger'],
      description: 'Variant of the move controls. Default `ghost`.',
    },
    moveUpLabel: {
      description: "Accessible name of an item's move-up control. Required.",
    },
    moveDownLabel: {
      description: "Accessible name of an item's move-down control. Required.",
    },
    announcement: {
      description:
        "Formats the moved item's new position (from 1) for the polite " +
        'live region. Required.',
    },
    onMove: {
      description:
        '(item, to, from): called only for a real move; the caller ' +
        'reorders `items`.',
    },
  },
  render: (args) => <Demo {...args} />,
};
export default meta;

type Story = StoryObj<typeof ReorderableList<Task>>;

// Keyboard only: the row moves, focus stays on the control and the new
// position is announced.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Tasks' });
    const region = canvas.getByRole('status');
    await expect(region).toBeEmptyDOMElement();

    const up = canvas.getByRole('button', { name: 'Move Order food up' });
    up.focus();
    await userEvent.keyboard('{Enter}');
    const rows = within(list).getAllByRole('listitem');
    await expect(rows[0]).toHaveTextContent('Order food');
    await expect(up).toHaveFocus();
    await expect(region).toHaveTextContent(
      'Order food moved to position 1 of 3',
    );

    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(within(list).getAllByRole('listitem')[1]).toHaveTextContent(
      'Order food',
    );
    await expect(region).toHaveTextContent(
      'Order food moved to position 2 of 3',
    );
  },
};

// At either end the control stays focusable, marked unavailable, and the
// press changes nothing.
export const AtTheEnds: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstUp = canvas.getByRole('button', {
      name: 'Move Book the vet up',
    });
    await expect(firstUp).toHaveAttribute('aria-disabled', 'true');
    await expect(firstUp).toBeEnabled();
    await userEvent.click(firstUp);
    await expect(canvas.getAllByRole('listitem')[0]).toHaveTextContent(
      'Book the vet',
    );
    await expect(canvas.getByRole('status')).toBeEmptyDOMElement();
  },
};

// Richer rows with a rule between them.
export const DividedWithDetail: Story = {
  args: {
    divided: true,
    gap: 3,
    renderItem: (task) => (
      <>
        <Text as="span" weight="medium">
          {task.name}
        </Text>
        <Text as="span" size="caption" tone="soft">
          {' '}
          {task.detail}
        </Text>
      </>
    ),
  },
};
