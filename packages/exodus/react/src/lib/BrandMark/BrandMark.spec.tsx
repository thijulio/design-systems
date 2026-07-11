import { render, screen, fireEvent } from '@testing-library/react';
import { BrandMark } from './BrandMark';

describe('BrandMark', () => {
  it('renders as a button when onClick is provided', () => {
    const onClick = jest.fn();
    render(<BrandMark name="Companion" onClick={onClick} />);
    const btn = screen.getByRole('button', { name: /Companion/ });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('uses the wordmark face for the PMP wordmark, sans otherwise', () => {
    const { rerender } = render(<BrandMark name="Companion" />);
    expect(screen.getByText('Companion').closest('span')).toBeTruthy();
    // static (no onClick) renders a non-button
    expect(screen.queryByRole('button')).toBeNull();

    rerender(<BrandMark name="PMP" />);
    const wrap = screen.getByText('PMP').parentElement as HTMLElement;
    expect(wrap.style.getPropertyValue('--bm-family')).toBe(
      'var(--font-wordmark)',
    );
  });
});
