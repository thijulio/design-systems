import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { Card } from '@thijulio/exodus-react';

const meta: Meta<typeof Card> = {
  title: 'Exodus/Components/Card',
  component: Card,
  args: {
    pad: true,
    children:
      'The standard white surface — stone border, lg radius, elevation.',
  },
  argTypes: {
    pad: {
      control: 'boolean',
      description: 'Apply the default 18/20 padding.',
    },
    interactive: {
      control: 'boolean',
      description: 'Add the hover-lift used by clickable cards.',
    },
    padding: {
      control: 'inline-radio',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Explicit padding step; wins over `pad`.',
    },
    surface: {
      control: 'inline-radio',
      options: ['raised', 'flat', 'sunken', 'dashed'],
      description: 'raised (default: border + shadow), flat, sunken, dashed.',
    },
    tone: {
      control: 'inline-radio',
      options: [
        'neutral',
        'accent',
        'info',
        'success',
        'warning',
        'danger',
        'inverse',
      ],
      description: 'Tinted panel; neutral (default) keeps the surface.',
    },
    as: {
      control: 'inline-radio',
      options: ['div', 'section', 'article', 'li', 'aside'],
      description: 'Root element; the visual is the same.',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 340 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByText(/standard white surface/i);
    const style = getComputedStyle(card);
    await expect(style.backgroundColor).toBe('rgb(255, 255, 255)');
    await expect(style.borderColor).toBe('rgb(227, 224, 217)');
    await expect(style.borderRadius).toBe('12px');
    await expect(style.paddingTop).toBe('18px');
    await expect(style.paddingLeft).toBe('20px');
  },
};
export const Interactive: Story = { args: { interactive: true } };
export const LegacyStylesheet: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The existing Exodus tokens still style Card without a --ds-* contract.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(document.getElementById('brand-tokens')?.textContent).toContain(
        '--ds-',
      ),
    );
    const stylesheet = document.getElementById('brand-tokens');
    if (!stylesheet?.textContent)
      throw new Error('Exodus tokens were not loaded');
    const original = stylesheet.textContent;
    try {
      // The previous published token stylesheet has no shared-contract aliases.
      stylesheet.textContent = original.replace(
        /--(?:ds-[a-z0-9-]+|card-padding-[xy])\s*:[^;]+;/g,
        '',
      );
      const style = getComputedStyle(
        within(canvasElement).getByText(/standard white surface/i),
      );
      await expect(style.backgroundColor).toBe('rgb(255, 255, 255)');
      await expect(style.borderColor).toBe('rgb(227, 224, 217)');
      await expect(style.borderRadius).toBe('12px');
      await expect(style.paddingTop).toBe('18px');
      await expect(style.paddingLeft).toBe('20px');
      await expect(style.boxShadow).not.toBe('none');
    } finally {
      stylesheet.textContent = original;
    }
  },
};

export const Surfaces: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {(['raised', 'flat', 'sunken', 'dashed'] as const).map((surface) => (
        <Card key={surface} surface={surface} padding="md">
          {surface}
        </Card>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {(
        [
          'neutral',
          'accent',
          'info',
          'success',
          'warning',
          'danger',
          'inverse',
        ] as const
      ).map((tone) => (
        <Card key={tone} tone={tone} padding="sm">
          {tone}
        </Card>
      ))}
    </div>
  ),
};

// A header row (title, description, actions) above the content. The header
// and the body share the padding step, so the title lines up with the body.
export const WithHeader: Story = {
  args: {
    padding: { block: 4, inline: 6 },
    title: 'Litter of May',
    description: 'Four kittens, two reserved',
    actions: <button type="button">Edit</button>,
    children: 'Vaccinations are up to date.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByRole('heading', {
      level: 3,
      name: 'Litter of May',
    });
    await expect(title).toBeVisible();
    const body = canvas.getByText('Vaccinations are up to date.');
    // The header row is a `div` (no banner semantics), the body's sibling.
    const header = body.previousElementSibling;
    if (!(header instanceof HTMLElement) || !header.contains(title))
      throw new Error('Card header not rendered');
    await expect(getComputedStyle(body).paddingTop).toBe('16px');
    await expect(getComputedStyle(body).paddingLeft).toBe('24px');
    await expect(getComputedStyle(header).paddingLeft).toBe('24px');
  },
};
