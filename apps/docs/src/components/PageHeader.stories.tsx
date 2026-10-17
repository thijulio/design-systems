import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import {
  Badge,
  Button,
  Inline,
  PageHeader,
  Spinner,
} from '@thijulio/primitives';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/PageHeader',
  component: PageHeader,
  args: {
    title: 'Projects',
    subtitle: 'Everything your team is working on, in one place.',
  },
  argTypes: {
    title: { control: 'text', description: 'Page title.' },
    subtitle: {
      control: 'text',
      description: 'Muted line under the title.',
    },
    actions: {
      control: false,
      description: 'Page-level controls aligned to the end.',
    },
    children: {
      control: false,
      description: 'Extra content under the subtitle.',
    },
    headingLevel: {
      control: 'inline-radio',
      options: [1, 2],
      description: 'Outline level of the title (default 1).',
    },
  },
};
export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Projects' }),
    ).toBeVisible();
    // A div, never a banner landmark.
    await expect(canvas.queryByRole('banner')).toBeNull();
  },
};

export const WithActions: Story = {
  args: {
    actions: (
      <Inline gap={2}>
        <Button variant="secondary">Export</Button>
        <Button>New project</Button>
      </Inline>
    ),
  },
};

// Extra content sits under the subtitle.
export const WithChildren: Story = {
  args: {
    children: (
      <Inline gap={2}>
        <Badge>12 active</Badge>
        <Badge>3 archived</Badge>
      </Inline>
    ),
  },
};

// Inside a page that already has an h1.
export const SecondLevel: Story = {
  args: { headingLevel: 2, title: 'Archived projects', subtitle: undefined },
};

// While the page loads, the title is a visible Spinner: the page keeps its
// h1, and the status region announces the wait.
export const Loading: Story = {
  args: {
    title: <Spinner label="Loading…" labelVisible />,
    subtitle: undefined,
  },
  argTypes: { title: { control: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', { level: 1 });
    const status = canvas.getByRole('status');
    await expect(heading).toContainElement(status);
    await expect(status).toHaveTextContent('Loading…');
  },
};
