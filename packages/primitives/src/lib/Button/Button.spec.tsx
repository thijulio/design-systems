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

  it('forwards a custom type', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('renders a navigable link when href is supplied', () => {
    render(<Button href="/projects">Explore</Button>);
    expect(screen.getByRole('link', { name: 'Explore' })).toHaveAttribute(
      'href',
      '/projects',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('keeps disabled links inert by rendering a disabled button', () => {
    const onClick = jest.fn();
    render(
      <Button href="/projects" disabled onClick={onClick}>
        Explore
      </Button>,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute('href');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
