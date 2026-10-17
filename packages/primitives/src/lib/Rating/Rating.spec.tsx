import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Rating } from './Rating';

describe('Rating', () => {
  it('is an image named by its label', () => {
    render(<Rating value={4.5} label="4.5 out of 5" />);
    expect(screen.getByRole('img', { name: '4.5 out of 5' })).toBeInTheDocument();
  });

  it('renders one star per max, filled to the nearest lower half', () => {
    const { container } = render(<Rating value={2.6} max={4} label="2.6 out of 4" />);
    const stars = Array.from(container.querySelectorAll('svg'));
    expect(stars).toHaveLength(4);
    expect(stars.map((svg) => svg.getAttribute('data-fill'))).toEqual([
      '1',
      '1',
      '0.5',
      '0',
    ]);
  });

  it('gives each instance its own gradient ids', () => {
    const { container } = render(
      <>
        <Rating value={3.5} label="3.5 out of 5" />
        <Rating value={1.5} label="1.5 out of 5" />
      </>,
    );
    // Attribute selector: SVG's camelCase tag names are awkward to select in jsdom.
    const ids = Array.from(container.querySelectorAll('[id^="ds-rating-"]')).map(
      (gradient) => gradient.id,
    );
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) {
      expect(container.querySelector(`path[fill="url(#${id})"]`)).not.toBeNull();
    }
  });

  it('shows an optional formatted value after the image, not inside it', () => {
    render(<Rating value={4.25} label="4.3 out of 5" valueText="4,3" />);
    const image = screen.getByRole('img', { name: '4.3 out of 5' });
    const value = screen.getByText('4,3');
    expect(image).not.toContainElement(value);
    expect(image.nextElementSibling).toBe(value);
  });

  it('forwards ref to the root that holds the image and the value', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Rating ref={ref} value={3} label="3 out of 5" valueText="3" />);
    expect(ref.current).toContainElement(screen.getByRole('img'));
    expect(ref.current).toContainElement(screen.getByText('3'));
  });
});
