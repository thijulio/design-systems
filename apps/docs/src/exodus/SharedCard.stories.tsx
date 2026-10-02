import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '@thijulio/primitives';

const meta: Meta<typeof Card> = {
  title: 'Exodus/Shared/Card',
  component: Card,
  args: { pad: true, children: 'A shared card with the Exodus surface.' },
  parameters: {
    docs: {
      description: {
        component:
          'The same @thijulio/primitives Card used by Faune, styled by the Exodus semantic contract.',
      },
    },
  },
  argTypes: {
    pad: { description: 'Apply brand spacing inside the card.' },
    interactive: { description: 'Add hover feedback.' },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {};
export const Interactive: Story = {
  args: { interactive: true, children: 'Open details' },
};
