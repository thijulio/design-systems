import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  DescriptionList,
  Icon,
  ResultState,
  Text,
} from '@thijulio/primitives';

const meta: Meta<typeof ResultState> = {
  title: 'Components/ResultState',
  component: ResultState,
  argTypes: {
    title: { description: 'What happened. Required; no default copy.' },
    message: { description: 'What it means or what to do next.' },
    headingLevel: {
      control: 'inline-radio',
      options: [1, 2, 3, 4, 5, 6],
      description: 'Heading element for the title (default 1).',
    },
    icon: { description: 'Decorative icon in a tone-coloured tile.' },
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'info', 'success', 'warning', 'danger'],
      description: 'Colour of the icon tile (default neutral).',
    },
    announce: {
      control: 'inline-radio',
      options: ['status', 'alert', 'off'],
      description: 'Role of the title-and-message block (default status).',
    },
    actions: { description: 'The way forward, laid out in a row.' },
    align: {
      control: 'inline-radio',
      options: ['start', 'center'],
    },
  },
  args: {
    title: 'Address confirmed',
    message: 'Your account is ready. You can sign in now.',
    actions: <Button>Sign in</Button>,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ResultState>;

export const Default: Story = {};

/** A link that no longer works: an alert, with a way to ask again. */
export const Failure: Story = {
  args: {
    title: 'That link did not work',
    message: 'It has expired. Ask for a new one and use it within a day.',
    announce: 'alert',
    tone: 'danger',
    icon: <Icon name="alert" size={24} />,
    actions: <Button variant="secondary">Send a new link</Button>,
  },
};

/** Extra content sits between the message and the actions. */
export const WithRecord: Story = {
  args: {
    title: 'Your workspace is live',
    message: 'Here is what was recorded.',
    tone: 'success',
    icon: <Icon name="check" size={24} />,
    children: (
      <DescriptionList
        items={[
          { term: 'Name', description: 'North Shelter' },
          { term: 'Activated', description: '14 October 2026' },
        ]}
      />
    ),
    actions: (
      <>
        <Button>Add a record</Button>
        <Text size="body-sm" tone="soft">
          You can do this later from the dashboard.
        </Text>
      </>
    ),
  },
};

/** Centred, as a page that could not be found. */
export const Centered: Story = {
  args: {
    title: 'Page not found',
    message: 'The address may be mistyped, or the page has moved.',
    align: 'center',
    actions: <Button>Back to home</Button>,
  },
};
