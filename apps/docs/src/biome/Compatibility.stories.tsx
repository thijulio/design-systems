import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Card, Tag } from '@thijulio/biome-react';
import { expect, waitFor, within } from 'storybook/test';
import { withLegacyTokens } from '../_test/legacy-styles';
import { hoverInBrowserTest } from '../_test/hover';

const meta: Meta = {
  title: 'Biome/Components/Compatibility',
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <style>{'.consumer-compact { padding: 4px; }'}</style>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button size="sm">Small action</Button>
        <Button>Default action</Button>
        <Button size="lg">Large action</Button>
        <Button variant="secondary">Outline action</Button>
        <Button variant="ghost">Ghost action</Button>
        <Button href="#compatibility">Navigate</Button>
        <Button className="consumer-compact">Custom action</Button>
        <Button disabled>Disabled action</Button>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Tag status data-testid="outline-tag">
          Available
        </Tag>
        <Tag variant="muted" data-testid="muted-tag">
          Editorial
        </Tag>
        <Tag>
          <span aria-hidden="true" data-testid="consumer-icon">
            ↗
          </span>
          External
        </Tag>
      </div>
      <Card
        data-testid="editorial-card"
        kicker="Case study"
        title="Editorial card"
      >
        Reading copy
      </Card>
      <Card
        className="consumer-compact"
        data-testid="custom-card"
        title="Custom card"
      />
      <Card
        variant="expressive"
        data-testid="expressive-card"
        title="Expressive card"
      >
        <Card title="Nested editorial" data-testid="nested-editorial-card" />
      </Card>
    </div>
  ),
};
export default meta;
type Story = StoryObj;

async function checkSkin(canvasElement: HTMLElement, dark: boolean) {
  const canvas = within(canvasElement);
  for (const [label, padding, size] of [
    ['Small action', '8px 14px', '13px'],
    ['Default action', '11px 20px', '14px'],
    ['Large action', '13px 24px', '16px'],
  ]) {
    const style = getComputedStyle(canvas.getByRole('button', { name: label }));
    await expect(style.padding).toBe(padding);
    await expect(style.fontSize).toBe(size);
    await expect(style.fontWeight).toBe('600');
    await expect(style.borderRadius).toBe('6px');
    await expect(style.backgroundColor).toBe(
      dark ? 'rgb(143, 176, 137)' : 'rgb(63, 82, 55)',
    );
    await expect(style.boxShadow).toBe('none');
  }
  await expect(canvas.getByRole('link', { name: 'Navigate' })).toHaveAttribute(
    'href',
    '#compatibility',
  );
  const card = getComputedStyle(canvas.getByTestId('editorial-card'));
  await expect(card.padding).toBe('28px 26px');
  await expect(card.borderRadius).toBe('8px');
  await expect(card.boxShadow).toBe('none');
  await expect(
    getComputedStyle(canvas.getByTestId('nested-editorial-card')).borderWidth,
  ).toBe('1px');
  await expect(card.backgroundColor).toBe(
    dark ? 'rgb(30, 38, 30)' : 'rgb(248, 245, 236)',
  );
  await expect(
    canvas
      .getByTestId('expressive-card')
      .querySelectorAll('[aria-hidden="true"]'),
  ).toHaveLength(2);
  const muted = getComputedStyle(canvas.getByTestId('muted-tag'));
  await expect(muted.fontFamily).toContain('JetBrains Mono');
  await expect(muted.fontSize).toBe('12px');
  await expect(
    getComputedStyle(canvas.getByRole('button', { name: 'Custom action' }))
      .padding,
  ).toBe('4px');
  await expect(
    getComputedStyle(canvas.getByTestId('custom-card')).padding,
  ).toBe('4px');
  await expect(
    getComputedStyle(canvas.getByTestId('consumer-icon')).animationName,
  ).toBe('none');
  const secondary = canvas.getByRole('button', { name: 'Outline action' });
  await expect(getComputedStyle(secondary).backgroundColor).toBe(
    'rgba(0, 0, 0, 0)',
  );
  if (await hoverInBrowserTest(secondary)) {
    await waitFor(() =>
      expect(getComputedStyle(secondary).color).toBe(
        dark ? 'rgb(22, 29, 22)' : 'rgb(242, 238, 226)',
      ),
    );
    await expect(getComputedStyle(secondary).borderColor).toBe(
      dark ? 'rgb(143, 176, 137)' : 'rgb(63, 82, 55)',
    );
    const disabled = canvas.getByRole('button', { name: 'Disabled action' });
    await hoverInBrowserTest(disabled);
    // Remove transition timing so a disabled hover regression is observable.
    disabled.style.transition = 'none';
    await expect(getComputedStyle(disabled).backgroundColor).toBe(
      dark ? 'rgb(143, 176, 137)' : 'rgb(63, 82, 55)',
    );
  }
}

export const Light: Story = {
  globals: { mode: 'light' },
  play: ({ canvasElement }) =>
    withLegacyTokens(() => checkSkin(canvasElement, false)),
};
export const Dark: Story = {
  globals: { mode: 'dark' },
  play: ({ canvasElement }) =>
    withLegacyTokens(() => checkSkin(canvasElement, true)),
};
