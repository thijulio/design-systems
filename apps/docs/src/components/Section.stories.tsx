import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  Button,
  Container,
  PageHeader,
  Section,
  Stack,
  Text,
} from '@thijulio/primitives';

const meta: Meta<typeof Section> = {
  title: 'Components/Section',
  component: Section,
  args: {
    title: 'Notifications',
    description: 'Choose how and when we contact you.',
    children: (
      <Text size="body-sm">Email digests are sent every Monday morning.</Text>
    ),
  },
  argTypes: {
    as: {
      control: 'inline-radio',
      options: ['section', 'div', 'article'],
      description: 'Element to render; defaults to `section`.',
    },
    title: { control: 'text', description: 'Heading text.' },
    description: {
      control: 'text',
      description: 'Muted line under the title.',
    },
    actions: {
      control: false,
      description: 'Controls aligned to the end of the header row.',
    },
    headingLevel: {
      control: 'inline-radio',
      options: [2, 3, 4, 5, 6],
      description: 'Outline level of the title (default 2).',
    },
    surface: {
      control: 'inline-radio',
      options: ['plain', 'raised', 'sunken', 'wash', 'accent'],
      description:
        'Background treatment (default plain). `wash` is a full-bleed page ' +
        'band; `accent` a lead panel (hero) outlined in the soft accent.',
    },
    padding: {
      control: 'inline-radio',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Inner padding; `none` on plain and wash, `md` otherwise.',
    },
    gap: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16],
      description: 'Vertical gap between the header and each child.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Section>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Notifications' }),
    ).toBeVisible();
    await expect(
      canvas.getByText('Choose how and when we contact you.'),
    ).toBeVisible();
  },
};

export const WithActions: Story = {
  args: { actions: <Button variant="secondary">Edit</Button> },
};

export const Raised: Story = { args: { surface: 'raised' } };

export const Sunken: Story = { args: { surface: 'sunken', padding: 'lg' } };

export const Accent: Story = {
  args: {
    as: 'div',
    surface: 'accent',
    padding: 'xl',
    title: undefined,
    description: undefined,
    children: (
      <PageHeader
        title="Plan your week"
        subtitle="Everything you need, in one place."
        actions={<Button>Get started</Button>}
      />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Plan your week' }),
    ).toBeVisible();
    // A div root adds no landmark around the page title.
    await expect(canvas.queryByRole('region')).toBeNull();
    // The panel itself is not a tab stop; the first stop is its action.
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Get started' }),
    ).toHaveFocus();
  },
};

// A page band behind a centred column, with an accent hero and prose that
// keeps a readable measure.
export const Wash: Story = {
  render: () => (
    <Section as="div" surface="wash">
      <Container paddingBlock={12}>
        <Stack gap={8}>
          <Section as="div" surface="accent" padding="xl">
            <PageHeader
              title="Plan your week"
              subtitle="Everything you need, in one place."
            >
              <Text tone="soft" measure="prose">
                Lay out the days ahead, keep notes beside each task and share
                the plan with the people who need it.
              </Text>
            </PageHeader>
          </Section>
          <Section title="How it works">
            <Text size="body-sm" tone="soft" measure="prose">
              Add a task, give it a day, and it appears on the board.
            </Text>
          </Section>
        </Stack>
      </Container>
    </Section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Plan your week' }),
    ).toBeVisible();
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'How it works' }),
    ).toBeVisible();
  },
};
