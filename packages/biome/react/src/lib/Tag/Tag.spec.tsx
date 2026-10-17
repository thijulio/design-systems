import { createRef } from 'react';
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

  it('forwards a ref to the root element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Tag ref={ref} data-testid="tag">
        Senior
      </Tag>,
    );
    expect(ref.current).toBe(screen.getByTestId('tag'));
  });

  it('has a displayName for React DevTools', () => {
    expect(Tag.displayName).toBe('Tag');
  });
});
