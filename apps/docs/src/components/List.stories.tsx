import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button, Card, List, ListItem, Text } from '@thijulio/primitives';

const meta: Meta<typeof List> = {
  title: 'Components/List',
  component: List,
  args: { gap: 2 },
  argTypes: {
    as: { control: 'inline-radio', options: ['ul', 'ol'] },
    marker: { control: 'inline-radio', options: ['none', 'disc', 'decimal'] },
    divided: { description: 'Draw a subtle rule between items.' },
    gap: {
      description:
        'Space between items; with `divided`, on each side of the rule.',
    },
    columns: {
      control: 'object',
      description:
        'Equal grid columns, optionally per breakpoint ' +
        '(`{ base: 1, md: 3 }`). Unset keeps a single column.',
    },
  },
  render: (args) => (
    <List {...args}>
      <ListItem>Vaccinations up to date</ListItem>
      <ListItem>Microchipped</ListItem>
      <ListItem>Neutered</ListItem>
    </List>
  ),
};
export default meta;

type Story = StoryObj<typeof List>;

// role="list" stays on the element, so Safari still announces a list whose
// markers are hidden.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list');
    await expect(list).toHaveAttribute('role', 'list');
    await expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  },
};

export const Bulleted: Story = { args: { marker: 'disc', gap: 1 } };

export const Ordered: Story = {
  args: { as: 'ol', marker: 'decimal', gap: 1 },
};

// A rule between rows; the item padding gives the rows their height.
export const DividedWithActions: Story = {
  args: { divided: true, gap: 3 },
  render: (args) => (
    <List {...args}>
      {['Rocket', 'Biscuit', 'Pepper'].map((name) => (
        <ListItem
          key={name}
          actions={
            <>
              <Text as="span" size="caption" tone="soft">
                Waiting
              </Text>
              <Button variant="secondary">Open</Button>
            </>
          }
        >
          <Text as="span" weight="medium">
            {name}
          </Text>
        </ListItem>
      ))}
    </List>
  ),
};

// A grid of cards that is still a list: one `li` per card, read as a list.
export const Columns: Story = {
  args: { as: 'ol', gap: 4, columns: { base: 1, md: 3 } },
  render: (args) => (
    <List {...args}>
      {['Create an account', 'Fill in your profile', 'Publish'].map(
        (step, index) => (
          <ListItem key={step}>
            <Card pad>
              <Text as="span" size="caption" tone="muted" weight="semibold">
                {index + 1}
              </Text>
              <Text size="body-sm">{step}</Text>
            </Card>
          </ListItem>
        ),
      )}
    </List>
  ),
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list');
    await expect(list.tagName).toBe('OL');
    await expect(list).toHaveAttribute('role', 'list');
    await expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    await expect(getComputedStyle(list).display).toBe('grid');
  },
};
