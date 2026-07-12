import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavIcon, ICON_PATHS } from '@thijulio/exodus-react';
import type { IconName } from '@thijulio/exodus-react';

const NAMES = Object.keys(ICON_PATHS) as IconName[];

const meta: Meta<typeof NavIcon> = {
  title: 'Exodus/Identity/NavIcon',
  component: NavIcon,
  args: { name: 'paw', size: 24 },
  argTypes: { name: { control: 'select', options: NAMES } },
};
export default meta;

type Story = StoryObj<typeof NavIcon>;

export const Single: Story = {};

/** The full inline-SVG registry the product draws from. */
export const Registry: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))',
        gap: 16,
        color: 'var(--n-700)',
      }}
    >
      {NAMES.map((name) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: 'var(--n-500)',
          }}
        >
          <NavIcon name={name} size={24} />
          {name}
        </div>
      ))}
    </div>
  ),
};
