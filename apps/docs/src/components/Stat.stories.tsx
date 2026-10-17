import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Card, Grid, Stat } from '@thijulio/primitives';

const meta: Meta<typeof Stat> = {
  title: 'Components/Stat',
  component: Stat,
  args: {
    label: 'Active users',
    value: '12,480',
    caption: '+8% vs last month',
  },
  argTypes: {
    label: { description: 'What the figure measures, shown above it.' },
    value: { description: 'The headline number or short value.' },
    caption: { description: 'Optional context line under the value.' },
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'accent', 'success', 'warning', 'danger'],
      description: 'Colour of the value for its intent.',
    },
    markup: {
      control: 'inline-radio',
      options: ['text', 'dl'],
      description:
        '`text`: paragraphs. `dl`: a `<dt>`/`<dd>` group for a parent `<dl>`.',
    },
    layout: {
      control: 'inline-radio',
      options: ['stacked', 'inline'],
      description:
        '`stacked`: value under the label. `inline`: value at the end.',
    },
    valueTestId: {
      description: '`data-testid` set on the value element only.',
    },
    headingLevel: {
      control: 'inline-radio',
      options: [2, 3, 4, 5, 6],
      description:
        'Render the label as a heading of this level, to keep the page ' +
        'outline. Same look. Ignored with `markup="dl"`.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Stat>;

// Plain text in reading order: label, then value, then caption.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const text = canvasElement.textContent ?? '';
    await expect(text.indexOf('Active users')).toBeLessThan(
      text.indexOf('12,480'),
    );
    await expect(text.indexOf('12,480')).toBeLessThan(
      text.indexOf('+8% vs last month'),
    );
    await expect(within(canvasElement).getByText('12,480')).toBeVisible();
  },
};

export const WithoutCaption: Story = { args: { caption: undefined } };

const STATS = [
  { tone: 'neutral', label: 'Orders', value: '1,204', caption: 'This week' },
  { tone: 'accent', label: 'Conversion', value: '3.2%', caption: 'Goal 3%' },
  { tone: 'success', label: 'Uptime', value: '99.98%', caption: 'Last 30 days' },
  { tone: 'warning', label: 'Open tickets', value: '37', caption: '12 overdue' },
  { tone: 'danger', label: 'Failed payments', value: '5', caption: 'Today' },
] as const;

export const Tones: Story = {
  render: () => (
    <Grid minItemWidth="10rem" gap={4}>
      {STATS.map((stat) => (
        <Stat key={stat.label} {...stat} />
      ))}
    </Grid>
  ),
};

export const Inline: Story = {
  args: { layout: 'inline', valueTestId: 'stat-value' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('stat-value')).toHaveTextContent(
      /^12,480$/,
    );
  },
};

// Each Stat is a `<div>` group of one term and its details inside the `<dl>`.
export const InDescriptionList: Story = {
  render: () => (
    <Grid as="dl" minItemWidth="10rem" gap={4}>
      {STATS.slice(0, 3).map(({ tone, label, value }) => (
        <Stat
          key={label}
          markup="dl"
          tone={tone}
          label={label}
          value={value}
        />
      ))}
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('term')).toHaveLength(3);
    await expect(canvas.getAllByRole('definition')).toHaveLength(3);
    await expect(canvas.getByText('Orders').tagName).toBe('DT');
    await expect(canvas.getByText('1,204').tagName).toBe('DD');
  },
};

// Each card stands for a section, so its label is an h3 in the outline.
export const AsHeading: Story = {
  render: () => (
    <Grid minItemWidth="10rem" gap={4}>
      {STATS.slice(0, 3).map(({ label, value, caption }) => (
        <Card key={label} pad>
          <Stat
            headingLevel={3}
            label={label}
            value={value}
            caption={caption}
          />
        </Card>
      ))}
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const headings = canvas.getAllByRole('heading', { level: 3 });
    await expect(headings.map((heading) => heading.textContent)).toEqual([
      'Orders',
      'Conversion',
      'Uptime',
    ]);
  },
};
