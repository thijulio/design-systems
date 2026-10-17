import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders a button with type=button by default', () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('forwards clicks and is inert when disabled', () => {
    const onClick = jest.fn();
    const { rerender } = render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button onClick={onClick} disabled>
        Go
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('forwards a ref to the rendered element', () => {
    const ref = createRef<HTMLButtonElement | HTMLAnchorElement>();
    render(<Button ref={ref}>Save</Button>);
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('passes the busy contract through: aria-busy, aria-disabled, press refused, never native disabled', () => {
    const onClick = jest.fn();
    render(
      <Button isLoading onClick={onClick}>
        Submit
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders its child via asChild', () => {
    render(
      <Button asChild variant="link" className="consumer">
        <a href="/adopt">Adopt</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Adopt' });
    expect(link).toHaveAttribute('href', '/adopt');
    expect(link).toHaveClass('consumer');
  });

  it('renders a link with typed anchor attributes when href is set', () => {
    render(
      <Button href="/guide" target="_blank" rel="noopener noreferrer">
        Guide
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Guide' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
