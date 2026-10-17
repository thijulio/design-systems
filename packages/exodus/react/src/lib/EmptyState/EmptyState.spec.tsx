import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title, body and action', () => {
    render(
      <EmptyState title="No animals yet" action={<button>Add</button>}>
        Add your first record to get started.
      </EmptyState>,
    );
    expect(
      screen.getByRole('heading', { name: 'No animals yet', level: 3 }),
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

  it('forwards a ref and DOM props to its root', () => {
    const ref = createRef<HTMLDivElement>();
    render(<EmptyState ref={ref} title="Rien" data-testid="empty" />);
    expect(ref.current).toBe(screen.getByTestId('empty'));
  });

  it('renders a message-only state and keeps the consumer class', () => {
    render(
      <EmptyState
        size="sm"
        surface="none"
        align="start"
        className="consumer"
        data-testid="empty"
      >
        Nothing yet.
      </EmptyState>,
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByTestId('empty')).toHaveTextContent('Nothing yet.');
    expect(screen.getByTestId('empty')).toHaveClass('compat', 'consumer');
  });
});
