import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DescriptionList, Link } from '@thijulio/primitives';

const meta: Meta<typeof DescriptionList> = {
  title: 'Components/DescriptionList',
  component: DescriptionList,
  args: {
    items: [
      { term: 'Full name', description: 'Alex Morgan' },
      { term: 'Email', description: 'alex.morgan@example.com' },
      { term: 'Member since', description: 'March 2021' },
      { term: 'Plan', description: 'Team (annual)' },
    ],
  },
  argTypes: {
    items: {
      description:
        'Term/description pairs; `testId` sets `data-testid` on each group.',
    },
    layout: {
      control: 'inline-radio',
      options: ['stacked', 'inline'],
      description:
        '`stacked`: term above description. `inline`: side by side.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof DescriptionList>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('term')).toHaveLength(4);
    await expect(canvas.getAllByRole('definition')).toHaveLength(4);
    await expect(canvas.getByText('Full name').tagName).toBe('DT');
  },
};

export const Inline: Story = { args: { layout: 'inline' } };

// Descriptions take any content, such as a link.
export const RichDescriptions: Story = {
  args: {
    layout: 'inline',
    items: [
      { term: 'Status', description: 'Active' },
      {
        term: 'Documentation',
        description: <Link href="#docs">Getting started guide</Link>,
      },
    ],
  },
};
