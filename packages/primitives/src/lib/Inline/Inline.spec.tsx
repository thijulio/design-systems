import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Inline } from './Inline';
import styles from './Inline.module.css';

describe('Inline', () => {
  it('centres items with a gap of 2 by default', () => {
    const { container } = render(<Inline />);
    expect(container.firstElementChild).toHaveClass(
      styles.inline,
      styles.alignCenter,
      styles.g2,
    );
    expect(container.firstElementChild).not.toHaveClass(styles.wrap);
  });

  it('maps justify, align, wrap and gap', () => {
    const { container } = render(
      <Inline justify="between" align="baseline" wrap gap={3} />,
    );
    expect(container.firstElementChild).toHaveClass(
      styles.justifyBetween,
      styles.alignBaseline,
      styles.wrap,
      styles.g3,
    );
  });

  it('honours `as`, ref and DOM props', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Inline as="nav" ref={ref} aria-label="Pages">
        <a href="/a">A</a>
      </Inline>,
    );
    const nav = screen.getByRole('navigation', { name: 'Pages' });
    expect(ref.current).toBe(nav);
  });
});
