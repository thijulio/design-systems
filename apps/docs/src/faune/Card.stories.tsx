import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '@thijulio/primitives';

const meta: Meta<typeof Card> = {
  title: 'Faune/Components/Card',
  component: Card,
  args: { pad: true, children: 'Une carte de service.' },
  argTypes: {
    pad: { description: 'Apply the default inner padding.' },
    interactive: { description: 'Add the hover-lift used by clickable cards.' },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {};
export const Padded: Story = {
  args: { children: 'Visite à domicile — 30 minutes, repas et litière.' },
};
export const Interactive: Story = {
  args: { interactive: true, children: 'Passer au caddie' },
};
