import { render, screen } from '@testing-library/react';
import { StatusBadge, STATE_TONE } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders a default label for a state and wires the mapped tone', () => {
    render(<StatusBadge state="cancelled" />);
    const el = screen.getByText('Cancelled');
    expect(STATE_TONE.cancelled).toBe('red');
    expect(el.style.getPropertyValue('--sb-soft')).toBe('var(--tone-red-soft)');
  });

  it('lets an explicit tone and label override the state', () => {
    render(<StatusBadge state="draft" tone="green" label="Live" />);
    const el = screen.getByText('Live');
    expect(el.style.getPropertyValue('--sb-dot')).toBe('var(--tone-green-dot)');
  });
});
