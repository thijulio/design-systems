import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders a button element by default', () => {
    render(<Button>Grow</Button>);
    const btn = screen.getByRole('button', { name: 'Grow' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('renders an anchor when href is provided', () => {
    render(<Button href="/projects">Explore</Button>);
    const link = screen.getByRole('link', { name: 'Explore' });
    expect(link).toHaveAttribute('href', '/projects');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('stays a (disabled) button when disabled, even with href', () => {
    render(
      <Button href="/projects" disabled>
        Explore
      </Button>,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not fire onClick when disabled', () => {
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Grow
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards onClick and arbitrary props', () => {
    const onClick = jest.fn();
    render(
      <Button onClick={onClick} aria-label="grow-action">
        Grow
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'grow-action' });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards a ref to the native button', () => {
    const ref = createRef<HTMLButtonElement | HTMLAnchorElement>();
    render(<Button ref={ref}>Grow</Button>);
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('forwards a ref to the anchor when href is provided', () => {
    const ref = createRef<HTMLButtonElement | HTMLAnchorElement>();
    render(
      <Button ref={ref} href="/projects">
        Explore
      </Button>,
    );
    expect(ref.current).toBe(screen.getByRole('link'));
  });

  it('has a displayName for React DevTools', () => {
    expect(Button.displayName).toBe('Button');
  });
});
