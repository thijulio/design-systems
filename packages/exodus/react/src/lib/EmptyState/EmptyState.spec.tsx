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
      screen.getByRole('heading', { name: 'No animals yet' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Add your first record to get started.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });
});
