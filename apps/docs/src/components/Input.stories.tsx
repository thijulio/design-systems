import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '@thijulio/primitives';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  args: { placeholder: 'Pet name', 'aria-label': 'Pet name' },
  argTypes: {
    invalid: { description: 'Flip to the danger outline.' },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true, defaultValue: 'Rex' } };
