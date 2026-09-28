import { render, screen } from '@testing-library/react';
import { Eyebrow } from './Eyebrow';

describe('Eyebrow', () => {
  it('renders its label', () => {
    render(<Eyebrow>Nos services</Eyebrow>);
    expect(screen.getByText('Nos services')).toBeInTheDocument();
  });

  it('renders a decorative hairline by default and hides it when line=false', () => {
    const { container, rerender } = render(<Eyebrow>Cat sitting</Eyebrow>);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();

    rerender(<Eyebrow line={false}>Cat sitting</Eyebrow>);
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});
