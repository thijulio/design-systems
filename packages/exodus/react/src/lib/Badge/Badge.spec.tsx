import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its content', () => {
    render(<Badge>12</Badge>);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('preserves consumer palette overrides when a tone is supplied', () => {
    render(
      <Badge
        tone="success"
        style={
          {
            '--badge-bg': 'rebeccapurple',
            '--badge-fg': 'white',
          } as React.CSSProperties
        }
      >
        new
      </Badge>,
    );
    const el = screen.getByText('new');
    expect(el.style.getPropertyValue('--badge-bg')).toBe('rebeccapurple');
    expect(el.style.getPropertyValue('--badge-fg')).toBe('white');
  });

  it.each([
    'neutral',
    'accent',
    'info',
    'success',
    'warning',
    'danger',
  ] as const)('renders the %s semantic tone', (tone) => {
    render(<Badge tone={tone}>label</Badge>);
    expect(screen.getByText('label')).toHaveAttribute('data-tone', tone);
  });

  it('maps an Exodus palette hue onto the --tone-* tokens', () => {
    render(<Badge tone="teal">Teal</Badge>);
    const el = screen.getByText('Teal');
    expect(el).toHaveAttribute('data-tone', 'teal');
    expect(el.style.getPropertyValue('--badge-bg')).toBe(
      'var(--tone-teal-soft)',
    );
    expect(el.style.getPropertyValue('--badge-fg')).toBe('var(--tone-teal-fg)');
  });

  it('forwards a ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>3</Badge>);
    expect(ref.current).toBe(screen.getByText('3'));
  });
});
