import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Stack } from './Stack';
import styles from './Stack.module.css';

describe('Stack', () => {
  it('renders a div by default and honours `as` without adding wrappers', () => {
    const { container, rerender } = render(
      <Stack>
        <p>One</p>
        <p>Two</p>
      </Stack>,
    );
    expect(container.firstElementChild?.tagName).toBe('DIV');

    rerender(
      <Stack as="ul">
        <li>One</li>
        <li>Two</li>
      </Stack>,
    );
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('UL');
    expect(list.querySelectorAll(':scope > li')).toHaveLength(2);
  });

  it('uses sibling-margin flow without align and a flex column with align', () => {
    const { container, rerender } = render(<Stack gap={6} />);
    const root = container.firstElementChild;
    expect(root).toHaveClass(styles.flow, styles.g6);
    expect(root).not.toHaveClass(styles.flex);

    rerender(<Stack gap={2} align="stretch" />);
    expect(root).toHaveClass(styles.flex, styles.alignStretch, styles.g2);
    expect(root).not.toHaveClass(styles.flow);
  });

  it('defaults the gap to 4', () => {
    const { container } = render(<Stack />);
    expect(container.firstElementChild).toHaveClass(styles.g4);
  });

  it('forwards ref, className and DOM props', () => {
    const ref = createRef<HTMLElement>();
    render(<Stack ref={ref} className="extra" data-testid="stack" />);
    const root = screen.getByTestId('stack');
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('extra');
  });
});
