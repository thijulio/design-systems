import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';
import styles from './Skeleton.module.css';

describe('Skeleton', () => {
  it('is decorative without a label', () => {
    const { container } = render(<Skeleton />);
    const root = container.firstElementChild;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('role');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('announces its label as a status when given one', () => {
    render(<Skeleton label="Loading section" />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading section');
    expect(status).not.toHaveAttribute('aria-hidden');
  });

  it('sets size through custom properties and maps the radius', () => {
    const { container } = render(<Skeleton width={120} height="2rem" radius="full" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--ds-skeleton-width')).toBe('120px');
    expect(root.style.getPropertyValue('--ds-skeleton-height')).toBe('2rem');
    expect(root).toHaveClass(styles.skeleton, styles.radiusFull);
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(<Skeleton ref={ref} />);
    expect(ref.current).toBe(container.firstElementChild);
  });
});
