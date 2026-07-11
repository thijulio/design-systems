import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from '@thijulio/biome-react';

const meta: Meta<typeof Tag> = {
  title: 'Biome/Tag',
  component: Tag,
  args: { children: 'TypeScript' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['outline', 'solid', 'muted'],
    },
    status: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Tag>;

export const Outline: Story = {};
export const Solid: Story = { args: { variant: 'solid' } };
export const Muted: Story = { args: { variant: 'muted', children: 'v2.1.0' } };
export const WithStatus: Story = {
  args: { variant: 'solid', status: true, children: 'Live' },
};
