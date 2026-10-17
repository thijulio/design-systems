import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ErrorState } from '@thijulio/exodus-react';

const meta: Meta<typeof ErrorState> = {
  title: 'Exodus/Components/ErrorState',
  component: ErrorState,
  argTypes: {
    message: { description: 'What went wrong.' },
    title: { description: 'Optional heading above the message.' },
    headingLevel: {
      control: 'inline-radio',
      options: [1, 2, 3, 4, 5, 6],
      description: 'Heading element for the title (default 2).',
    },
    retryLabel: { description: 'Visible retry label; no default copy.' },
    retrying: { description: 'A retry is in flight: busy, press refused.' },
    announce: {
      control: 'inline-radio',
      options: ['root', 'message', 'off'],
      description: 'Where role="alert" goes (default root).',
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center'],
    },
  },
  args: {
    message: 'The list could not be loaded.',
    retryLabel: 'Try again',
    onRetry: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {};

export const WithTitle: Story = {
  args: {
    title: 'Something went wrong',
    message: 'This page could not be displayed. You can try loading it again.',
    align: 'center',
    gap: 6,
    retrySize: 'sm',
  },
};

export const Retrying: Story = {
  args: { retrying: true, tone: 'danger', retrySize: 'sm' },
};
