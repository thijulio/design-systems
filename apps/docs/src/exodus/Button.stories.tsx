import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@thijulio/exodus-react';

const meta: Meta<typeof Button> = {
  title: 'Exodus/Button',
  component: Button,
  args: { children: 'Save changes' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: [
        'primary',
        'secondary',
        'soft',
        'ghost',
        'danger',
        'danger-outline',
      ],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Soft: Story = { args: { variant: 'soft' } };
export const Danger: Story = {
  args: { variant: 'danger', children: 'Delete' },
};
