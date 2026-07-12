import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast } from '@thijulio/exodus-react';

const meta: Meta<typeof Toast> = {
  title: 'Exodus/Feedback/Toast',
  component: Toast,
  args: {
    title: 'Changes saved',
    children: 'Your updates are live.',
    onClose: () => undefined,
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['success', 'warning', 'danger', 'info'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Toast>;

export const Info: Story = {};
export const Success: Story = { args: { tone: 'success' } };
export const Danger: Story = {
  args: { tone: 'danger', title: 'Upload failed', children: 'Please retry.' },
};
