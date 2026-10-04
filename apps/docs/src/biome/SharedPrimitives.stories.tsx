import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, Badge, Button, Card, Input, Tag } from '@thijulio/primitives';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta: Meta<typeof Button> = {
  title: 'Biome/Migration/Primitives',
  component: Button,
  args: { onClick: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Direct primitives use the Biome contract. Existing biome-react imports retain their established skin and API.',
      },
    },
  },
  render: (args) => (
    <Card pad style={{ display: 'grid', gap: 20, maxWidth: 440 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar initials="TV" />
        <Tag status>Biome shared contract</Tag>
        <Badge tone="warning">Review</Badge>
      </div>
      <Input aria-label="Project name" placeholder="Project name" />
      <div style={{ display: 'flex', gap: 12 }}>
        <Button {...args}>Save project</Button>
        <Button variant="danger">Delete project</Button>
      </div>
      <div data-mode="dark">
        <Button>Scoped dark action</Button>
      </div>
    </Card>
  ),
};
export default meta;
type Story = StoryObj<typeof Button>;

const interact = async ({
  args,
  canvasElement,
}: {
  args: { onClick?: unknown };
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  await userEvent.type(
    canvas.getByRole('textbox', { name: 'Project name' }),
    'Forest',
  );
  await expect(canvas.getByRole('textbox')).toHaveValue('Forest');
  await userEvent.click(canvas.getByRole('button', { name: 'Save project' }));
  await expect(args.onClick).toHaveBeenCalledTimes(1);
  await expect(
    getComputedStyle(canvas.getByRole('button', { name: 'Scoped dark action' }))
      .backgroundColor,
  ).toBe('rgb(143, 176, 137)');
};

export const Light: Story = { globals: { mode: 'light' }, play: interact };
export const Dark: Story = { globals: { mode: 'dark' }, play: interact };
