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
});
