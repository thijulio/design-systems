import { render, screen } from '@testing-library/react';
import { Tag } from './Tag';

describe('Tag', () => {
  it('renders its label', () => {
    render(<Tag>En cours</Tag>);
    expect(screen.getByText('En cours')).toBeInTheDocument();
  });

  it('renders a decorative status dot when status is set', () => {
    const { container } = render(<Tag status>Actif</Tag>);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).not.toBeNull();
  });
});
