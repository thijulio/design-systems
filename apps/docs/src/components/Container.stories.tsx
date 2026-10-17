import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Card, Container, Stack, Text } from '@thijulio/primitives';

const meta: Meta<typeof Container> = {
  title: 'Components/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  args: {
    size: '3xl',
    children: (
      <Card pad>
        <Text size="body-sm">Centred column content.</Text>
      </Card>
    ),
  },
  argTypes: {
    size: { description: 'Max width on the `max-w-*` scale.' },
    padded: { description: 'Responsive side gutters (on by default).' },
    paddingBlock: {
      description:
        'Top and bottom padding: a space step, or one per breakpoint.',
    },
    asChild: {
      control: false,
      description:
        'Put the classes, padding and ref on the single child element ' +
        '(e.g. a `Stack`) instead of rendering a wrapper.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Container>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Centred column content.')).toBeVisible();
  },
};

// A page column with vertical air from the spacing scale.
export const PaddingBlock: Story = { args: { paddingBlock: 10 } };

// Mobile first: 6 below md, 10 from md, 16 from xl.
export const ResponsivePaddingBlock: Story = {
  args: { paddingBlock: { base: 6, md: 10, xl: 16 } },
};

// One element is both the page column and the vertical rhythm: the Stack
// takes the container's classes and padding, with no wrapper around it.
export const AsChild: Story = {
  render: (args) => (
    <Container {...args} asChild paddingBlock={8}>
      <Stack as="section" gap={4} aria-label="Page column">
        <Card pad>
          <Text size="body-sm">First block.</Text>
        </Card>
        <Card pad>
          <Text size="body-sm">Second block.</Text>
        </Card>
      </Stack>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const column = within(canvasElement).getByRole('region', {
      name: 'Page column',
    });
    // The cards sit directly in the column: no extra wrapper node.
    await expect(column.children).toHaveLength(2);
    await expect(getComputedStyle(column).maxWidth).not.toBe('none');
    await expect(getComputedStyle(column).paddingTop).not.toBe('0px');
  },
};
