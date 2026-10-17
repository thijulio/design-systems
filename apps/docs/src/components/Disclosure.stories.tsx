import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Badge, Disclosure, Text } from '@thijulio/primitives';

const meta: Meta<typeof Disclosure> = {
  title: 'Components/Disclosure',
  component: Disclosure,
  args: {
    summary: 'Health records',
    children: 'Vaccinations up to date. Next booster in March.',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'plain'],
      description:
        '`plain` takes weight and colour from the context; the chevron ' +
        'follows the text.',
    },
    headingLevel: {
      control: 'select',
      options: [undefined, 2, 3, 4, 5, 6],
      description:
        'Accordion mode: `<h{level}><button aria-expanded>` instead of ' +
        '`<details>`/`<summary>`.',
    },
    summaryEnd: { description: 'Trailing content inside the toggle.' },
  },
};
export default meta;

type Story = StoryObj<typeof Disclosure>;

// Native <details>/<summary>.
export const Default: Story = {};

export const Plain: Story = {
  args: { variant: 'plain', summary: 'Show history' },
  render: (args) => (
    <Text as="div" size="body-sm" tone="soft">
      <Disclosure {...args} />
    </Text>
  ),
};

// When the toggle is also a section heading: the heading wraps the button,
// never the other way round.
export const Accordion: Story = {
  args: {
    headingLevel: 3,
    summary: (
      <Text as="span" size="h3" tone="inherit">
        Health records
      </Text>
    ),
    summaryEnd: <Badge tone="neutral">Chip 250 26</Badge>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', { level: 3 });
    const button = within(heading).getByRole('button');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText(/Vaccinations/)).toBeVisible();
  },
};
