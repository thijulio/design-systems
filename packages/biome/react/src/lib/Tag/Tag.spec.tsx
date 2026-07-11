import { render, screen } from '@testing-library/react';
import { Tag } from './Tag';

describe('Tag', () => {
  it('renders its label', () => {
    render(<Tag>TypeScript</Tag>);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('renders a status dot only when status is set', () => {
    const { container, rerender } = render(<Tag>Open</Tag>);
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();

    rerender(<Tag status>Open</Tag>);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('forwards arbitrary props', () => {
    render(<Tag data-testid="tag">Senior</Tag>);
    expect(screen.getByTestId('tag')).toBeInTheDocument();
  });
});
