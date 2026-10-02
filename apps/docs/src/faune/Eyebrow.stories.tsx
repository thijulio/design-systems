import type { Meta, StoryObj } from '@storybook/react-vite';
import { Eyebrow } from '@thijulio/faune-react';

const meta: Meta<typeof Eyebrow> = {
  title: 'Faune/Components/Eyebrow',
  component: Eyebrow,
  args: { children: 'Nos services' },
  argTypes: {
    line: { description: 'Show the leading hairline.' },
  },
};
export default meta;

type Story = StoryObj<typeof Eyebrow>;

export const Default: Story = {};
export const NoLine: Story = { args: { line: false } };
