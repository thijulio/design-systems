import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from '@thijulio/primitives';

const meta: Meta<typeof Tag> = {
  title: 'Faune/Components/Tag',
  component: Tag,
  args: { children: 'Visites' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['outline', 'solid', 'muted'],
      description: 'outline (default), solid brand, or muted.',
    },
    status: { description: 'Show a pulsing status dot before the label.' },
  },
};
export default meta;

type Story = StoryObj<typeof Tag>;

export const Outline: Story = {};
export const Solid: Story = { args: { variant: 'solid' } };
export const Muted: Story = { args: { variant: 'muted', children: 'chat' } };
export const WithStatus: Story = {
  args: { status: true, children: 'Disponible' },
};
