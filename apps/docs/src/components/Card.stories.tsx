import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '@thijulio/primitives';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  args: { pad: true, children: 'A service card.' },
  argTypes: {
    pad: { description: 'Apply the default inner padding.' },
    interactive: { description: 'Add the hover-lift used by clickable cards.' },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {};
export const Padded: Story = {
  args: { children: 'Home visit — 30 minutes, meals and litter.' },
};
export const Interactive: Story = {
  args: { interactive: true, children: 'Open details' },
};
