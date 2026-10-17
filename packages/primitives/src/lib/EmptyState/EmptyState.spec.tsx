import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import styles from './EmptyState.module.css';

describe('EmptyState', () => {
  it('renders title, body and action', () => {
    render(
      <EmptyState title="No records yet" action={<button>Add</button>}>
        Add your first record to get started.
      </EmptyState>,
    );
    expect(
      screen.getByRole('heading', { name: 'No records yet', level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Add your first record to get started.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('renders the title at the requested heading level', () => {
    render(<EmptyState title="Aucun résultat" headingLevel={2} />);
    expect(
      screen.getByRole('heading', { name: 'Aucun résultat', level: 2 }),
    ).toBeInTheDocument();
  });

  it('renders no heading without a title', () => {
    render(<EmptyState>Nothing matches these filters.</EmptyState>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(
      screen.getByText('Nothing matches these filters.'),
    ).toBeInTheDocument();
  });

  it('accepts block content in the body and renders no built-in text', () => {
    const { container } = render(
      <EmptyState title="Rien">
        <p>Première ligne</p>
        <p>Seconde ligne</p>
      </EmptyState>,
    );
    expect(screen.getByText('Seconde ligne')).toBeInTheDocument();
    expect(container).toHaveTextContent(/^RienPremière ligneSeconde ligne$/);
  });

  it('hides the icon tile from assistive technology', () => {
    render(<EmptyState icon={<svg data-testid="glyph" />} title="Rien" />);
    expect(screen.getByTestId('glyph').parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('defaults to a medium, dashed, centred panel', () => {
    render(<EmptyState data-testid="empty">Rien</EmptyState>);
    expect(screen.getByTestId('empty')).toHaveClass(
      styles.md,
      styles.dashed,
      styles.center,
    );
  });

  it('renders the compact, inline, start-aligned variant', () => {
    render(
      <EmptyState data-testid="empty" size="sm" surface="none" align="start">
        Rien
      </EmptyState>,
    );
    const root = screen.getByTestId('empty');
    expect(root).toHaveClass(styles.sm, styles.plain, styles.start);
    expect(root).not.toHaveClass(styles.dashed);
  });

  it('forwards a ref, DOM props and a class name to its root', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <EmptyState
        ref={ref}
        title="Rien"
        data-testid="empty"
        className="consumer"
      />,
    );
    expect(ref.current).toBe(screen.getByTestId('empty'));
    expect(ref.current).toHaveClass('consumer');
  });
});
