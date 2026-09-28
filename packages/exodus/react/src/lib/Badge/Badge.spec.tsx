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
});
