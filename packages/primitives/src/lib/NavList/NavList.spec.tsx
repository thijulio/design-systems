import { createRef, forwardRef, type AnchorHTMLAttributes } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { NavItem, NavList } from './NavList';
import styles from './NavList.module.css';

// Stands in for a router link: it sets `aria-current` itself.
const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }
>(function RouterLink({ active, ...props }, ref) {
  return <a ref={ref} aria-current={active ? 'page' : undefined} {...props} />;
});

describe('NavList', () => {
  it('renders a named nav around a ul of li > a, horizontal and text', () => {
    render(
      <NavList aria-label="Main">
        <NavItem href="/one">One</NavItem>
        <NavItem href="/two">Two</NavItem>
      </NavList>,
    );
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav.tagName).toBe('NAV');
    expect(nav).toHaveClass(styles.root, styles.text);
    expect(nav).not.toHaveClass(styles.inverse);
    expect(nav).not.toHaveClass(styles.withActions);
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('UL');
    expect(list).toHaveAttribute('role', 'list');
    expect(list).toHaveClass(styles.list, styles.horizontal, styles.g2);
    expect(list.querySelectorAll(':scope > li > a')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'One' })).toHaveClass(styles.item);
  });

  it('maps orientation and gap per breakpoint, variant and tone', () => {
    render(
      <NavList
        aria-label="Sections"
        orientation={{ base: 'horizontal', lg: 'vertical' }}
        gap={{ base: 2, lg: 3 }}
        variant="block"
        tone="inverse"
        listClassName="extra-list"
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Sections' });
    expect(nav).toHaveClass(styles.block, styles.inverse);
    expect(screen.getByRole('list')).toHaveClass(
      styles.horizontal,
      styles.lgVertical,
      styles.g2,
      styles.lgG3,
      'extra-list',
    );
  });

  it('puts the actions after the list, inside the landmark', () => {
    render(
      <NavList
        aria-label="Main"
        actions={<button type="button">Sign out</button>}
      >
        <NavItem href="/">Home</NavItem>
      </NavList>,
    );
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toHaveClass(styles.withActions);
    const [list, action] = Array.from(nav.children);
    expect(list.tagName).toBe('UL');
    expect(action).toBe(screen.getByRole('button', { name: 'Sign out' }));
  });

  it('forwards ref, className and DOM props to the nav', () => {
    const ref = createRef<HTMLElement>();
    render(
      <NavList ref={ref} aria-label="Main" className="extra" data-testid="n" />,
    );
    const nav = screen.getByTestId('n');
    expect(ref.current).toBe(nav);
    expect(nav).toHaveClass('extra', styles.root);
  });
});

describe('NavItem', () => {
  it('sets aria-current="page" from `current` only', () => {
    render(
      <NavList aria-label="Main">
        <NavItem href="/one" current>
          One
        </NavItem>
        <NavItem href="/two" current={false}>
          Two
        </NavItem>
        <NavItem href="/three">Three</NavItem>
      </NavList>,
    );
    expect(screen.getByRole('link', { name: 'One' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Two' })).not.toHaveAttribute(
      'aria-current',
    );
    expect(screen.getByRole('link', { name: 'Three' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('styles the child with asChild and keeps the li, ref and handlers', () => {
    const ref = createRef<HTMLAnchorElement>();
    const childRef = createRef<HTMLAnchorElement>();
    const onClick = jest.fn();
    render(
      <NavList aria-label="Main">
        <NavItem asChild ref={ref} className="extra" onClick={onClick}>
          <RouterLink
            ref={childRef}
            href="#one"
            active
            className="own"
            data-testid="router-link"
          >
            One
          </RouterLink>
        </NavItem>
      </NavList>,
    );
    const link = screen.getByTestId('router-link');
    expect(link.parentElement?.tagName).toBe('LI');
    expect(link).toHaveClass(styles.item, 'extra', 'own');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(ref.current).toBe(link);
    expect(childRef.current).toBe(link);
    expect(link.querySelector('a')).toBeNull();
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('puts `current` on a button child through asChild', () => {
    render(
      <NavList aria-label="Main">
        <NavItem asChild current>
          <button type="button">Two</button>
        </NavItem>
      </NavList>,
    );
    const button = screen.getByRole('button', { name: 'Two' });
    expect(button).toHaveAttribute('aria-current', 'page');
    expect(button).toHaveClass(styles.item);
  });
});
