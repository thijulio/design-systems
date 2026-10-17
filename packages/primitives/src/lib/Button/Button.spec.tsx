import { createRef, forwardRef, type AnchorHTMLAttributes } from 'react';
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

  it('forwards a ref to the native button', () => {
    const ref = createRef<HTMLButtonElement | HTMLAnchorElement>();
    render(<Button ref={ref}>Save</Button>);
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('keeps a consumer className alongside its own', () => {
    render(<Button className="consumer">Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('consumer');
  });

  describe('link mode', () => {
    it('renders a navigable link when href is supplied', () => {
      render(<Button href="/projects">Explore</Button>);
      expect(screen.getByRole('link', { name: 'Explore' })).toHaveAttribute(
        'href',
        '/projects',
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('passes typed anchor attributes and drops button-only ones', () => {
      const ref = createRef<HTMLButtonElement | HTMLAnchorElement>();
      render(
        <Button
          ref={ref}
          href="/doc.pdf"
          target="_blank"
          rel="noopener noreferrer"
          name="ignored"
          form="ignored"
        >
          Download
        </Button>,
      );
      const link = screen.getByRole('link', { name: 'Download' });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).not.toHaveAttribute('name');
      expect(link).not.toHaveAttribute('form');
      expect(link).not.toHaveAttribute('type');
      expect(ref.current).toBe(link);
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

  describe('loading', () => {
    it.each([false, true])(
      'stays natively enabled and announces busy + unavailable (disabled=%s)',
      (disabled) => {
        render(
          <Button isLoading disabled={disabled}>
            Submit
          </Button>,
        );
        const button = screen.getByRole('button', { name: 'Submit' });
        expect(button).not.toBeDisabled();
        expect(button).toHaveAttribute('aria-busy', 'true');
        expect(button).toHaveAttribute('aria-disabled', 'true');
      },
    );

    it('refuses a press without calling its click handler', () => {
      const onClick = jest.fn();
      render(
        <Button isLoading onClick={onClick}>
          Send
        </Button>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Send' }));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('submits no form when a loading submit button is pressed', () => {
      const onSubmit = jest.fn((event: { preventDefault(): void }) =>
        event.preventDefault(),
      );
      render(
        <form onSubmit={onSubmit}>
          <Button type="submit" isLoading>
            Raise
          </Button>
        </form>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Raise' }));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('renders a decorative spinner and an optional visually hidden label', () => {
      const { rerender } = render(<Button isLoading>Download</Button>);
      const button = screen.getByRole('button', { name: 'Download' });
      expect(button.querySelector('[aria-hidden="true"]')).not.toBeNull();

      rerender(
        <Button isLoading loadingLabel="Downloading">
          Download
        </Button>,
      );
      expect(
        screen.getByRole('button', { name: /Downloading/ }),
      ).toBeInTheDocument();
    });

    it('does not draw a spinner when idle', () => {
      render(<Button>Download</Button>);
      expect(
        screen.getByRole('button').querySelector('[aria-hidden="true"]'),
      ).toBeNull();
    });

    it('stays natively disabled when disabled without loading', () => {
      render(<Button disabled>Save</Button>);
      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).toBeDisabled();
      expect(button).not.toHaveAttribute('aria-busy');
    });

    it.each([
      ['isLoading is false', false, undefined, 'false'],
      ['the caller announces busy itself', undefined, true, 'true'],
    ] as const)(
      'keeps the caller unavailability when %s',
      (_state, isLoading, callerBusy, busy) => {
        render(
          <Button isLoading={isLoading} aria-busy={callerBusy} aria-disabled>
            Rename
          </Button>,
        );
        const button = screen.getByRole('button', { name: 'Rename' });
        expect(button).toHaveAttribute('aria-busy', busy);
        expect(button).toHaveAttribute('aria-disabled', 'true');
      },
    );

    it('refuses navigation on a loading link but keeps it focusable', () => {
      const onClick = jest.fn();
      render(
        <Button href="/next" isLoading onClick={onClick}>
          Next
        </Button>,
      );
      const link = screen.getByText('Next').closest('a') as HTMLAnchorElement;
      expect(link).toHaveAttribute('href', '/next');
      expect(link).toHaveAttribute('aria-busy', 'true');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(fireEvent.click(link)).toBe(false);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('asChild', () => {
    // Stands in for a router link: forwards ref and className to an <a>.
    const RouterLink = forwardRef<
      HTMLAnchorElement,
      AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
    >(({ to, ...props }, ref) => <a ref={ref} href={to} {...props} />);
    RouterLink.displayName = 'RouterLink';

    it('renders the child with merged classes and passthrough props', () => {
      const ref = createRef<HTMLButtonElement | HTMLAnchorElement>();
      render(
        <Button asChild ref={ref} className="outer" data-testid="cta">
          <RouterLink to="/checkout" className="inner">
            Checkout
          </RouterLink>
        </Button>,
      );
      const link = screen.getByRole('link', { name: 'Checkout' });
      expect(link).toHaveAttribute('href', '/checkout');
      expect(link).toHaveClass('outer', 'inner');
      expect(link).toHaveAttribute('data-testid', 'cta');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(ref.current).toBe(link);
    });

    it('takes the child out of the tab order and refuses presses when disabled or loading', () => {
      const onClick = jest.fn();
      const { rerender } = render(
        <Button asChild disabled onClick={onClick}>
          <RouterLink to="/checkout">Checkout</RouterLink>
        </Button>,
      );
      let link = screen.getByRole('link', { name: 'Checkout' });
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).toHaveAttribute('tabindex', '-1');
      fireEvent.click(link);
      expect(onClick).not.toHaveBeenCalled();

      rerender(
        <Button asChild isLoading onClick={onClick}>
          <RouterLink to="/checkout">Checkout</RouterLink>
        </Button>,
      );
      link = screen.getByRole('link', { name: 'Checkout' });
      expect(link).toHaveAttribute('aria-busy', 'true');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(link);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('calls both the child and the Button click handlers when enabled', () => {
      const onButtonClick = jest.fn();
      const onChildClick = jest.fn();
      render(
        <Button asChild onClick={onButtonClick}>
          <a href="#checkout" onClick={onChildClick}>
            Checkout
          </a>
        </Button>,
      );
      fireEvent.click(screen.getByRole('link', { name: 'Checkout' }));
      expect(onChildClick).toHaveBeenCalledTimes(1);
      expect(onButtonClick).toHaveBeenCalledTimes(1);
    });

    it("lets the child's preventDefault veto the Button's onClick", () => {
      const onButtonClick = jest.fn();
      render(
        <Button asChild onClick={onButtonClick}>
          <a href="#checkout" onClick={(event) => event.preventDefault()}>
            Checkout
          </a>
        </Button>,
      );
      fireEvent.click(screen.getByRole('link', { name: 'Checkout' }));
      expect(onButtonClick).not.toHaveBeenCalled();
    });

    it("keeps the child's own aria state and style when not overridden", () => {
      render(
        <Button asChild style={{ margin: 0 }}>
          <a
            href="#checkout"
            aria-busy="true"
            style={{ color: 'rgb(255, 0, 0)' }}
          >
            Checkout
          </a>
        </Button>,
      );
      const link = screen.getByRole('link', { name: 'Checkout' });
      expect(link).toHaveAttribute('aria-busy', 'true');
      expect(link).toHaveStyle({ color: 'rgb(255, 0, 0)', margin: '0px' });
    });
  });
});
