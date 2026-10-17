import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge, STATE_TONE } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders the given label and wires the tone mapped from the state', () => {
    render(<StatusBadge state="cancelled" label="Annulé" />);
    const el = screen.getByText('Annulé');
    expect(STATE_TONE.cancelled).toBe('red');
    expect(el).toHaveAttribute('data-tone', 'red');
    expect(el.style.getPropertyValue('--sb-soft')).toBe('var(--tone-red-soft)');
  });

  it('lets an explicit tone override the state', () => {
    render(<StatusBadge state="draft" tone="green" label="Live" />);
    const el = screen.getByText('Live');
    expect(el.style.getPropertyValue('--sb-dot')).toBe('var(--tone-green-dot)');
  });

  it('renders no built-in text: only the label is announced', () => {
    render(<StatusBadge state="active" label="Disponible" />);
    expect(screen.getByText('Disponible')).toHaveTextContent(/^Disponible$/);
    expect(screen.queryByText('Active')).toBeNull();
  });

  it('falls back to the neutral tone and forwards a ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<StatusBadge ref={ref} label="Unknown" />);
    expect(ref.current).toBe(screen.getByText('Unknown'));
    expect(ref.current).toHaveAttribute('data-tone', 'neutral');
  });
});
