import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { GridItem } from './GridItem';
import styles from './GridItem.module.css';

describe('GridItem', () => {
  it('maps a span, full and responsive spans', () => {
    const { container, rerender } = render(<GridItem span={2} />);
    const root = container.firstElementChild;
    expect(root).toHaveClass(styles.span2);

    rerender(<GridItem span="full" />);
    expect(root).toHaveClass(styles.spanFull);

    rerender(<GridItem span={{ md: 2, lg: 'full' }} />);
    expect(root).toHaveClass(styles.mdSpan2, styles.lgSpanFull);
    expect(root).not.toHaveClass(styles.span2);
  });

  it('renders no span class without span', () => {
    const { container } = render(<GridItem />);
    expect(container.firstElementChild?.getAttribute('class') ?? '').toBe('');
  });

  it('honours `as` and ref', () => {
    const ref = createRef<HTMLElement>();
    render(
      <ul>
        <GridItem as="li" ref={ref}>
          Item
        </GridItem>
      </ul>,
    );
    expect(ref.current).toBe(screen.getByRole('listitem'));
  });
});
