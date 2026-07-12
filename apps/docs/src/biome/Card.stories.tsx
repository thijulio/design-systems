import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '@thijulio/biome-react';

const meta: Meta<typeof Card> = {
  title: 'Biome/Components/Card',
  component: Card,
  args: {
    kicker: 'Case study',
    title: 'Living interface',
    children: 'A resilient, real-time surface that grows with its data.',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['editorial', 'expressive'],
      description:
        'editorial = tight geometry, flat surface; expressive = soft curve on mata with arcs.',
    },
    kicker: { description: 'Small mono label above the title.' },
    title: { description: 'Display-font heading.' },
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

type Story = StoryObj<typeof Card>;

export const Editorial: Story = {};
export const Expressive: Story = { args: { variant: 'expressive' } };
