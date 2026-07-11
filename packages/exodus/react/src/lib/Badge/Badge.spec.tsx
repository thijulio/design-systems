import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its content', () => {
    render(<Badge>12</Badge>);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('wires the tone into CSS custom properties', () => {
    render(<Badge tone="success">new</Badge>);
    const el = screen.getByText('new');
    expect(el.style.getPropertyValue('--badge-bg')).toBe('var(--success-soft)');
    expect(el.style.getPropertyValue('--badge-fg')).toBe('var(--success-fg)');
  });
});
