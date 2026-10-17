import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { VisuallyHidden } from './VisuallyHidden';
import styles from './VisuallyHidden.module.css';

describe('VisuallyHidden', () => {
  it('keeps its text in the accessibility tree inside a span', () => {
    render(
      <button type="button">
        <span aria-hidden="true">×</span>
        <VisuallyHidden>Close</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    const text = screen.getByText('Close');
    expect(text.tagName).toBe('SPAN');
    expect(text).toHaveClass(styles.hidden);
  });

  it('uses the focusable variant for skip links', () => {
    render(
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>,
    );
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).toHaveClass(styles.focusable);
    expect(link).not.toHaveClass(styles.hidden);
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLElement>();
    render(<VisuallyHidden ref={ref}>Hidden</VisuallyHidden>);
    expect(ref.current).toBe(screen.getByText('Hidden'));
  });
});
