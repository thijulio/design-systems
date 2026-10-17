import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Heading, Stack } from '@thijulio/primitives';

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading,
  args: { level: 2, children: 'Recent activity' },
  argTypes: {
    level: {
      control: 'inline-radio',
      options: [1, 2, 3, 4, 5, 6],
      description: 'Document outline level; renders `h{level}`.',
    },
    size: {
      control: 'select',
      options: [
        'caption',
        'body-sm',
        'body',
        'lead',
        'h3',
        'h2',
        'h1',
        'display',
      ],
      description: 'Visual size, independent of the level. Defaults by level.',
    },
    tone: {
      control: 'select',
      options: ['default', 'secondary', 'muted', 'accent'],
      description: 'Semantic colour.',
    },
    weight: {
      control: 'inline-radio',
      options: ['regular', 'medium', 'semibold', 'bold', 'extra'],
      description: 'Defaults to bold for levels 1–2, semibold for 3–6.',
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      description: 'Text alignment.',
    },
    tracking: {
      control: 'inline-radio',
      options: ['tight', 'normal', 'eyebrow'],
      description: 'Letter spacing.',
    },
    truncate: { description: 'Single line, clipped with an ellipsis.' },
  },
};
export default meta;

type Story = StoryObj<typeof Heading>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading', { level: 2 });
    await expect(heading).toHaveTextContent('Recent activity');
  },
};

// The default size for each level, in outline order.
export const Levels: Story = {
  render: () => (
    <Stack gap={3}>
      <Heading level={1}>Account settings</Heading>
      <Heading level={2}>Profile</Heading>
      <Heading level={3}>Contact details</Heading>
      <Heading level={4}>Email addresses</Heading>
      <Heading level={5}>Primary address</Heading>
      <Heading level={6}>Verification</Heading>
    </Stack>
  ),
};

// A level-3 heading drawn at the lead size: outline and look are separate.
export const SizeDecoupled: Story = {
  args: { level: 3, size: 'lead', children: 'Billing summary' },
};
