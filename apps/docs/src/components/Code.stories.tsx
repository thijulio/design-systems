import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button, Code, Grid, Stack, Text } from '@thijulio/primitives';

const meta: Meta<typeof Code> = {
  title: 'Components/Code',
  component: Code,
  args: { children: 'npm run build', block: false, size: 'inherit' },
  argTypes: {
    block: {
      description:
        'Render `<pre><code>`: keeps line breaks and wraps long lines. ' +
        'Props and the ref always land on the `<code>`.',
    },
    size: {
      control: 'inline-radio',
      options: ['inherit', 'caption', 'body-sm', 'body'],
      description: 'Type size; `inherit` (default) follows the text around it.',
    },
    children: { control: 'text', description: 'The code or key to show.' },
  },
  render: (args) => (
    <Text>
      Run <Code {...args} /> before you publish.
    </Text>
  ),
};
export default meta;

type Story = StoryObj<typeof Code>;

// Inline code inside body copy, in the brand's `--ds-font-mono` face.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const code = within(canvasElement).getByText('npm run build');
    await expect(code.tagName).toBe('CODE');
    await expect(getComputedStyle(code).fontFamily).toMatch(/monospace/);
  },
};

// A multi-line snippet. It wraps rather than scrolls, so it adds no tab stop.
export const Block: Story = {
  args: {
    block: true,
    size: 'body-sm',
    children: 'const total = items.length;\nconsole.log(total);',
  },
  render: (args) => (
    <Stack gap={3}>
      <Code {...args} />
      <Button>Next step</Button>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const code = canvas.getByText(/const total/);
    await expect(code.parentElement?.tagName).toBe('PRE');
    await expect(code.textContent).toContain('\n');
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Next step' }),
    ).toHaveFocus();
  },
};

// A long unspaced key breaks anywhere instead of overflowing.
export const LongKey: Story = {
  args: {
    block: true,
    size: 'body-sm',
    children:
      'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP',
  },
  render: (args) => (
    <div style={{ maxWidth: 240 }}>
      <Code {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const code = canvasElement.querySelector('code');
    await expect(code).not.toBeNull();
    await expect(code?.scrollWidth).toBeLessThanOrEqual(
      (code?.clientWidth ?? 0) + 1,
    );
  },
};

// One-time codes in a grid; the mono face lines the characters up.
export const CodeList: Story = {
  render: (args) => (
    <Grid
      as="ul"
      columns={2}
      gap={2}
      style={{ listStyle: 'none', margin: 0, padding: 0 }}
    >
      {['4F7K-29QD', 'X8MN-3PLA', 'R2TV-7HWE', 'B6CJ-K5ZU'].map((value) => (
        <li key={value}>
          <Code {...args} size="body-sm">
            {value}
          </Code>
        </li>
      ))}
    </Grid>
  ),
};
