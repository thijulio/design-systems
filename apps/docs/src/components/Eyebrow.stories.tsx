import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Eyebrow, Heading, Stack } from '@thijulio/primitives';

const meta: Meta<typeof Eyebrow> = {
  title: 'Components/Eyebrow',
  component: Eyebrow,
  args: { children: 'What is new', line: true },
  argTypes: {
    line: { description: 'Show the leading hairline (default on).' },
    children: { control: 'text', description: 'Overline text.' },
  },
};
export default meta;

type Story = StoryObj<typeof Eyebrow>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const eyebrow = within(canvasElement).getByText('What is new');
    // The hairline is decorative.
    await expect(eyebrow.querySelector('[aria-hidden="true"]')).not.toBeNull();
  },
};

export const WithoutLine: Story = { args: { line: false } };

// Leads a section heading.
export const OverHeading: Story = {
  render: (args) => (
    <Stack gap={2}>
      <Eyebrow {...args} />
      <Heading level={2}>Faster search across your workspace</Heading>
    </Stack>
  ),
};
