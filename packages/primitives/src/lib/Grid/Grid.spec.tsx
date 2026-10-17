import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Grid } from './Grid';
import styles from './Grid.module.css';

describe('Grid', () => {
  it('maps a column count to the base class', () => {
    const { container } = render(<Grid columns={3} />);
    expect(container.firstElementChild).toHaveClass(
      styles.grid,
      styles.cols3,
      styles.g4,
    );
  });

  it('maps responsive columns to one class per breakpoint', () => {
    const { container } = render(
      <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 6 }} />,
    );
    expect(container.firstElementChild).toHaveClass(
      styles.cols1,
      styles.smCols2,
      styles.mdCols3,
      styles.lgCols4,
      styles.xlCols6,
    );
  });

  it('auto-fits tracks from minItemWidth through a custom property', () => {
    const { container } = render(
      <Grid minItemWidth="160px" columns={2} style={{ color: 'inherit' }} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass(styles.autoFit);
    expect(root).not.toHaveClass(styles.cols2);
    expect(root.style.getPropertyValue('--ds-grid-min-item')).toBe('160px');
    expect(root.style.color).toBe('inherit');
  });

  it('honours `as`, gap, align and ref', () => {
    const ref = createRef<HTMLElement>();
    render(<Grid as="ul" ref={ref} gap={8} align="start" />);
    const list = screen.getByRole('list');
    expect(ref.current).toBe(list);
    expect(list).toHaveClass(styles.g8, styles.alignStart);
  });
});
