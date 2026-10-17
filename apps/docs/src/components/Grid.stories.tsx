import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Card, Grid, GridItem, Text } from '@thijulio/primitives';

const PLANS = [
  'Starter',
  'Team',
  'Business',
  'Enterprise',
  'Education',
  'Nonprofit',
];

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid',
  component: Grid,
  subcomponents: { GridItem },
  args: { columns: 3, gap: 4 },
  argTypes: {
    as: {
      control: 'inline-radio',
      options: ['div', 'ul'],
      description: 'Element to render.',
    },
    columns: {
      description:
        'Equal-width columns (1–6), or one count per breakpoint (`{ base: 1, md: 2 }`).',
    },
    minItemWidth: {
      control: 'text',
      description:
        'Auto-fit as many columns as fit at this minimum width; overrides `columns`.',
    },
    gap: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16],
      description: 'Space between cells, on the space scale.',
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Block-axis alignment of items in their cell.',
    },
  },
  render: (args) => (
    <Grid {...args}>
      {PLANS.map((plan) => (
        <Card key={plan} pad>
          <Text size="body-sm">{plan}</Text>
        </Card>
      ))}
    </Grid>
  ),
};
export default meta;

type Story = StoryObj<typeof Grid>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const plan of PLANS) {
      await expect(canvas.getByText(plan)).toBeVisible();
    }
  },
};

// Mobile first: one column below md, two from md, three from lg.
export const Responsive: Story = {
  args: { columns: { base: 1, md: 2, lg: 3 } },
};

// As many columns as fit at 12rem each.
export const AutoFit: Story = {
  args: { minItemWidth: '12rem' },
};

// GridItem spans several columns, optionally per breakpoint.
export const WithGridItem: Story = {
  args: { columns: 4 },
  render: (args) => (
    <Grid {...args}>
      <GridItem span="full">
        <Card pad>
          <Text size="body-sm">Overview (full width)</Text>
        </Card>
      </GridItem>
      <GridItem span={{ base: 'full', md: 3 }}>
        <Card pad>
          <Text size="body-sm">Main content (3 columns from md)</Text>
        </Card>
      </GridItem>
      <GridItem span={{ base: 'full', md: 1 }}>
        <Card pad>
          <Text size="body-sm">Sidebar</Text>
        </Card>
      </GridItem>
      <GridItem span={2}>
        <Card pad>
          <Text size="body-sm">Half</Text>
        </Card>
      </GridItem>
      <GridItem span={2}>
        <Card pad>
          <Text size="body-sm">Half</Text>
        </Card>
      </GridItem>
    </Grid>
  ),
};
