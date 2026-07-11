import type { Meta, StoryObj } from '@storybook/react-vite';
import { TerminalHero } from '@thijulio/biome-react';

const meta: Meta<typeof TerminalHero> = {
  title: 'Biome/TerminalHero',
  component: TerminalHero,
  parameters: { layout: 'fullscreen' },
  // loop off in the catalog so the type-in animation doesn't restart forever
  args: { loop: false },
};
export default meta;

type Story = StoryObj<typeof TerminalHero>;

export const Default: Story = {};
export const NoContours: Story = { args: { showContours: false } };
