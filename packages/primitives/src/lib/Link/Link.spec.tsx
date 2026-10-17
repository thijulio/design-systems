import { createRef, forwardRef, type AnchorHTMLAttributes } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Link } from './Link';
import styles from './Link.module.css';

const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(function RouterLink({ to, ...props }, ref) {
  return <a ref={ref} href={to} {...props} />;
});

describe('Link', () => {
  it('renders an anchor with accent tone and an underline by default (links in text need more than colour)', () => {
    render(<Link href="/pets">Pets</Link>);
    const link = screen.getByRole('link', { name: 'Pets' });
    expect(link).toHaveAttribute('href', '/pets');
    expect(link).toHaveClass(
      styles.link,
      styles.accent,
      styles.underlineAlways,
    );
  });

  it('maps tone and underline', () => {
    render(
      <Link href="/" tone="muted" underline="hover">
        Home
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass(
      styles.muted,
      styles.underlineHover,
    );
  });

  it('opens external links in a new tab with a hidden suffix', () => {
    render(
      <Link
        href="https://example.org"
        external
        externalLabel="(opens in a new tab)"
      >
        Docs
      </Link>,
    );
    const link = screen.getByRole('link', {
      name: 'Docs (opens in a new tab)',
    });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('styles the child element with asChild, merging className, ref and handlers', () => {
    const ref = createRef<HTMLAnchorElement>();
    const linkClick = jest.fn();
    const childClick = jest.fn();
    render(
      <Link asChild ref={ref} tone="inherit" onClick={linkClick}>
        <RouterLink to="/account" className="own" onClick={childClick}>
          Account
        </RouterLink>
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Account' });
    expect(link).toHaveAttribute('href', '/account');
    expect(link).toHaveClass('own', styles.link, styles.inherit);
    expect(ref.current).toBe(link);
    fireEvent.click(link);
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(linkClick).toHaveBeenCalledTimes(1);
  });

  it('appends the external suffix inside an asChild element', () => {
    render(
      <Link asChild external externalLabel="(new tab)">
        <RouterLink to="https://example.org">Partner</RouterLink>
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Partner (new tab)' });
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('forwards ref on the plain anchor', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Link ref={ref} href="/x">
        X
      </Link>,
    );
    expect(ref.current).toBe(screen.getByRole('link'));
  });
});
