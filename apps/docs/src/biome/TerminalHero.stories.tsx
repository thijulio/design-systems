import type { Meta, StoryObj } from '@storybook/react-vite';
import { TerminalHero } from '@thijulio/biome-react';

const meta: Meta<typeof TerminalHero> = {
  title: 'Biome/Components/TerminalHero',
  component: TerminalHero,
  parameters: { layout: 'fullscreen' },
  // loop off in the catalog so the type-in animation doesn't restart forever
  args: { loop: false },
  argTypes: {
    lines: {
      description:
        'Code lines rendered in the terminal, each self-typed in sequence.',
    },
    loop: { description: 'Replay the type-in animation every `cycleMs`.' },
    cycleMs: { description: 'Interval between replays when `loop` is on.' },
    showContours: { description: 'Toggle the decorative background arcs.' },
  },
};
export default meta;

type Story = StoryObj<typeof TerminalHero>;

export const Default: Story = {};
export const NoContours: Story = { args: { showContours: false } };
