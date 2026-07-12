import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '@thijulio/exodus-react';

const meta: Meta<typeof Card> = {
  title: 'Exodus/Core/Card',
  component: Card,
  args: {
    pad: true,
    children:
      'The standard white surface — stone border, lg radius, elevation.',
  },
  argTypes: {
    pad: { control: 'boolean' },
    interactive: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 340 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {};
export const Interactive: Story = { args: { interactive: true } };
