import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { List, ListItem } from './List';
import styles from './List.module.css';
import itemStyles from './ListItem.module.css';

describe('List', () => {
  it('renders a ul with role="list", no marker and no gap by default', () => {
    render(
      <List>
        <ListItem>One</ListItem>
        <ListItem>Two</ListItem>
      </List>,
    );
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('UL');
    expect(list).toHaveAttribute('role', 'list');
    expect(list).toHaveClass(styles.list, styles.g0);
    expect(list).not.toHaveClass(styles.divided);
    expect(list).not.toHaveClass(styles.markerDisc);
    expect(list.querySelectorAll(':scope > li')).toHaveLength(2);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('honours `as`, gap, divided and marker', () => {
    render(<List as="ol" gap={3} divided marker="decimal" start={2} />);
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(list).toHaveAttribute('start', '2');
    expect(list).toHaveClass(styles.g3, styles.divided, styles.markerDecimal);
  });

  it('stays a single column without `columns`', () => {
    render(<List />);
    expect(screen.getByRole('list')).not.toHaveClass(styles.grid);
  });

  it('lays out columns, per breakpoint, and keeps the li children', () => {
    render(
      <List as="ol" gap={4} columns={{ base: 1, sm: 2, lg: 3 }}>
        <ListItem>One</ListItem>
        <ListItem>Two</ListItem>
      </List>,
    );
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(list).toHaveClass(
      styles.list,
      styles.grid,
      styles.cols1,
      styles.smCols2,
      styles.lgCols3,
      styles.g4,
    );
    expect(list).not.toHaveClass(styles.mdCols3);
    expect(list.querySelectorAll(':scope > li')).toHaveLength(2);
  });

  it('maps a single column count to the base class', () => {
    render(<List columns={2} />);
    expect(screen.getByRole('list')).toHaveClass(styles.grid, styles.cols2);
  });

  it('lets a caller replace the role on purpose', () => {
    render(
      <List role="alert">
        <li>Too short</li>
      </List>,
    );
    expect(screen.getByRole('alert').tagName).toBe('UL');
  });

  it('forwards ref, className and DOM props', () => {
    const ref = createRef<HTMLElement>();
    render(<List ref={ref} className="extra" data-testid="list" />);
    const list = screen.getByTestId('list');
    expect(ref.current).toBe(list);
    expect(list).toHaveClass('extra', styles.list);
  });
});

describe('ListItem', () => {
  it('renders a plain li without wrappers when it has no actions', () => {
    const ref = createRef<HTMLLIElement>();
    render(
      <ul>
        <ListItem ref={ref} className="extra" data-testid="item">
          <span>Rocket</span>
        </ListItem>
      </ul>,
    );
    const item = screen.getByTestId('item');
    expect(ref.current).toBe(item);
    expect(item.tagName).toBe('LI');
    expect(item).toHaveClass('extra');
    expect(item).not.toHaveClass(itemStyles.row);
    expect(item.firstElementChild?.tagName).toBe('SPAN');
  });

  it('lays out a growing slot then the actions, in DOM order', () => {
    render(
      <ul>
        <ListItem
          data-testid="item"
          align="start"
          gap={4}
          actions={<button type="button">Remove</button>}
        >
          Rocket
        </ListItem>
      </ul>,
    );
    const item = screen.getByTestId('item');
    expect(item).toHaveClass(
      itemStyles.row,
      itemStyles.alignStart,
      itemStyles.g4,
    );
    const [grow, actions] = Array.from(item.children);
    expect(grow).toHaveClass(itemStyles.grow);
    expect(grow).toHaveTextContent('Rocket');
    expect(actions).toHaveClass(itemStyles.actions);
    expect(actions).toContainElement(
      screen.getByRole('button', { name: 'Remove' }),
    );
  });

  it('stays a plain li when actions are empty', () => {
    render(
      <ul>
        <ListItem data-testid="item" actions={false}>
          Rocket
        </ListItem>
      </ul>,
    );
    expect(screen.getByTestId('item')).not.toHaveClass(itemStyles.row);
  });
});
