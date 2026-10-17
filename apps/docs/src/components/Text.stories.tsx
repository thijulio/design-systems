import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Stack, Text } from '@thijulio/primitives';

const SIZES = [
  'caption',
  'body-sm',
  'body',
  'lead',
  'h3',
  'h2',
  'h1',
  'display',
] as const;

// Tones meant for text on the page background. Placeholder, disabled and the
// inverse tones need their own context, so they are left out of this sample.
const TONES = [
  'default',
  'secondary',
  'soft',
  'muted',
  'accent',
  'danger',
  'success',
  'warning',
  'info',
] as const;

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text,
  args: {
    children: 'The quick brown fox jumps over the lazy dog.',
  },
  argTypes: {
    as: {
      control: 'inline-radio',
      options: ['p', 'span', 'div', 'strong'],
      description: 'Element to render; defaults to `p`.',
    },
    size: {
      control: 'select',
      options: SIZES,
      description: 'Step on the type scale (default body).',
    },
    tone: {
      control: 'select',
      options: [...TONES, 'placeholder', 'disabled', 'inherit'],
      description: 'Semantic colour (default default).',
    },
    weight: {
      control: 'inline-radio',
      options: ['regular', 'medium', 'semibold', 'bold', 'extra'],
      description: 'Font weight.',
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      description: 'Text alignment.',
    },
    transform: {
      control: 'inline-radio',
      options: [undefined, 'uppercase'],
      description: 'Letter case transform.',
    },
    tracking: {
      control: 'inline-radio',
      options: ['tight', 'normal', 'eyebrow'],
      description: 'Letter spacing.',
    },
    truncate: { description: 'Single line, clipped with an ellipsis.' },
    wrap: {
      control: 'inline-radio',
      options: [undefined, 'anywhere'],
      description: 'Break long unspaced strings (URLs, ids) anywhere.',
    },
    measure: {
      control: 'inline-radio',
      options: [undefined, 'prose', 'narrow'],
      description:
        'Max line length for readable prose: `prose` 48rem, `narrow` 42rem.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Text>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText(/quick brown fox/);
    await expect(text.tagName).toBe('P');
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack gap={2}>
      {SIZES.map((size) => (
        <Text key={size} size={size}>
          {size} — Clear words, well set.
        </Text>
      ))}
    </Stack>
  ),
};

export const Tones: Story = {
  render: () => (
    <Stack gap={1}>
      {TONES.map((tone) => (
        <Text key={tone} tone={tone}>
          {tone} — Your settings were updated.
        </Text>
      ))}
    </Stack>
  ),
};

// Clipped to one line inside a narrow container.
export const Truncated: Story = {
  args: {
    truncate: true,
    children:
      'A very long file name that will not fit on one line in a narrow column.pdf',
  },
  render: (args) => (
    <div style={{ maxWidth: 240 }}>
      <Text {...args} />
    </div>
  ),
};

// A long unspaced string breaks instead of overflowing.
export const WrapAnywhere: Story = {
  args: {
    wrap: 'anywhere',
    size: 'body-sm',
    children: 'https://example.com/a/very/long/path/without/any/spaces/at/all',
  },
  render: (args) => (
    <div style={{ maxWidth: 200 }}>
      <Text {...args} />
    </div>
  ),
};

// Long copy on a wide page stops at a readable line length.
export const Measure: Story = {
  args: {
    measure: 'prose',
    children:
      'Short lines are easier to read. A paragraph that runs the full width ' +
      'of a wide screen makes the eye travel too far back to the start of ' +
      'the next line, so long copy stops at a comfortable measure while the ' +
      'layout around it stays full width.',
  },
  render: (args) => (
    <Stack gap={4}>
      <Text {...args} />
      <Text {...args} measure="narrow" />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const [prose, narrow] = within(canvasElement).getAllByText(/Short lines/);
    await expect(prose.tagName).toBe('P');
    await expect(narrow.getBoundingClientRect().width).toBeLessThanOrEqual(
      prose.getBoundingClientRect().width,
    );
  },
};
