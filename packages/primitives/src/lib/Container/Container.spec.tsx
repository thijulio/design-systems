import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';
import styles from './Container.module.css';

describe('Container', () => {
  it('defaults to the 7xl size with gutters', () => {
    const { container } = render(<Container>Body</Container>);
    expect(container.firstElementChild).toHaveClass(
      styles.container,
      styles.s7xl,
      styles.padded,
    );
  });

  it('maps size and drops gutters when padded is false', () => {
    const { container } = render(<Container size="3xl" padded={false} />);
    expect(container.firstElementChild).toHaveClass(styles.s3xl);
    expect(container.firstElementChild).not.toHaveClass(styles.padded);
  });

  it('adds no block padding unless paddingBlock is set', () => {
    const { container } = render(<Container />);
    const classes = container.firstElementChild?.className ?? '';
    expect(classes).not.toMatch(/(^|\s)(pb|\w+Pb)\d/);
  });

  it('maps a paddingBlock step to its class', () => {
    const { container } = render(<Container paddingBlock={8} />);
    expect(container.firstElementChild).toHaveClass(styles.pb8);
  });

  it('maps a responsive paddingBlock per breakpoint', () => {
    const { container } = render(
      <Container paddingBlock={{ base: 6, md: 10, xl: 16 }} />,
    );
    expect(container.firstElementChild).toHaveClass(
      styles.pb6,
      styles.mdPb10,
      styles.xlPb16,
    );
    expect(container.firstElementChild).not.toHaveClass(styles.pb10);
  });

  it('honours `as`, ref, className and test ids', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Container as="main" ref={ref} className="page" data-testid="page" />,
    );
    const main = screen.getByRole('main');
    expect(ref.current).toBe(main);
    expect(main).toHaveClass('page');
    expect(main).toHaveAttribute('data-testid', 'page');
  });

  it('puts classes, padding, props and ref on its asChild child', () => {
    const ref = createRef<HTMLElement>();
    const childRef = createRef<HTMLElement>();
    const { container } = render(
      <Container
        asChild
        as="main"
        ref={ref}
        size="3xl"
        paddingBlock={8}
        className="outer"
        data-testid="page"
      >
        <section ref={childRef} className="own" aria-label="Results">
          Body
        </section>
      </Container>,
    );
    const section = screen.getByRole('region', { name: 'Results' });
    expect(container.childElementCount).toBe(1);
    expect(container.firstElementChild).toBe(section);
    expect(screen.queryByRole('main')).toBeNull();
    expect(section).toHaveClass(
      styles.container,
      styles.s3xl,
      styles.padded,
      styles.pb8,
      'outer',
      'own',
    );
    expect(section).toHaveAttribute('data-testid', 'page');
    expect(section).toHaveTextContent('Body');
    expect(ref.current).toBe(section);
    expect(childRef.current).toBe(section);
  });

  it("keeps the child's own test id over the container's", () => {
    render(
      <Container asChild data-testid="outer">
        <div data-testid="inner" />
      </Container>,
    );
    expect(screen.getByTestId('inner')).toHaveClass(styles.container);
    expect(screen.queryByTestId('outer')).toBeNull();
  });
});
