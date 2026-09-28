import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, Badge, Button, Input, Textarea } from '@thijulio/exodus-react';
import { expect, within } from 'storybook/test';
import { withLegacyTokens } from '../_test/legacy-styles';

const meta: Meta = {
  title: 'Exodus/Shared/Compatibility',
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <style>{'.consumer-compact { padding: 4px; }'}</style>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button size="sm">Small action</Button>
        <Button>Default action</Button>
        <Button size="lg">Large action</Button>
        <Button variant="soft">Soft action</Button>
        <Button variant="danger-outline">Danger outline</Button>
        <Button className="consumer-compact">Custom action</Button>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Badge data-testid="neutral-badge">Count</Badge>
        <Avatar
          initials="TV"
          size={40}
          shape="rounded"
          tone="teal"
          data-testid="teal-avatar"
        />
        <Avatar initials="JD" variant="soft" data-testid="soft-avatar" />
      </div>
      <Input aria-label="Email" placeholder="Email address" />
      <Input aria-label="Custom input" className="consumer-compact" />
      <Input aria-label="Unavailable" disabled />
      <Input aria-label="Invalid email" invalid />
      <Textarea aria-label="Notes" placeholder="Notes" />
    </div>
  ),
};
export default meta;
type Story = StoryObj;

async function checkSkin(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  for (const [name, height, radius] of [
    ['Small action', '34px', '6px'],
    ['Default action', '40px', '9px'],
    ['Large action', '48px', '12px'],
  ]) {
    const style = getComputedStyle(canvas.getByRole('button', { name }));
    await expect(style.height).toBe(height);
    await expect(style.borderRadius).toBe(radius);
    await expect(style.fontWeight).toBe('700');
  }
  await expect(
    getComputedStyle(canvas.getByRole('button', { name: 'Danger outline' }))
      .backgroundColor,
  ).toBe('rgb(255, 255, 255)');
  const input = getComputedStyle(
    canvas.getByRole('textbox', { name: 'Email' }),
  );
  await expect(input.height).toBe('40px');
  await expect(input.padding).toBe('0px 12px');
  // Chromium at deviceScaleFactor=1 rasterizes the authored 1.5px border to 1px.
  await expect(input.borderWidth).toBe('1px');
  await expect(input.backgroundColor).toBe('rgb(255, 255, 255)');
  const textarea = getComputedStyle(
    canvas.getByRole('textbox', { name: 'Notes' }),
  );
  await expect(textarea.minHeight).toBe('84px');
  await expect(textarea.padding).toBe('10px 12px');
  await expect(
    getComputedStyle(canvas.getByTestId('neutral-badge')).backgroundColor,
  ).toBe('rgb(227, 224, 217)');
  const avatar = getComputedStyle(canvas.getByTestId('teal-avatar'));
  await expect(avatar.width).toBe('40px');
  await expect(avatar.fontSize).toBe('15.2px');
  await expect(avatar.fontWeight).toBe('800');
  await expect(avatar.borderRadius).toBe('9px');
  await expect(
    canvas.getByRole('textbox', { name: 'Unavailable' }),
  ).toBeDisabled();
  await expect(
    getComputedStyle(canvas.getByRole('button', { name: 'Custom action' }))
      .padding,
  ).toBe('4px');
  await expect(
    getComputedStyle(canvas.getByRole('textbox', { name: 'Custom input' }))
      .padding,
  ).toBe('4px');
}

const legacyCheck = ({ canvasElement }: { canvasElement: HTMLElement }) =>
  withLegacyTokens(() => checkSkin(canvasElement));

export const Sage: Story = { globals: { accent: 'sage' }, play: legacyCheck };
export const Clay: Story = { globals: { accent: 'clay' }, play: legacyCheck };
export const Harbor: Story = {
  globals: { accent: 'harbor' },
  play: legacyCheck,
};
