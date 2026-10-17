import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeScope, useThemeScope } from './ThemeScope';

const ScopeProbe = () => {
  const { theme, mode } = useThemeScope();
  return (
    <output data-testid="probe">
      {theme ?? 'none'}/{mode ?? 'none'}
    </output>
  );
};

describe('ThemeScope', () => {
  it('sets data-theme and data-mode on a div by default', () => {
    render(
      <ThemeScope theme="harbor" mode="dark" data-testid="scope">
        Content
      </ThemeScope>,
    );
    const scope = screen.getByTestId('scope');
    expect(scope.tagName).toBe('DIV');
    expect(scope).toHaveAttribute('data-theme', 'harbor');
    expect(scope).toHaveAttribute('data-mode', 'dark');
    expect(scope).toHaveTextContent('Content');
  });

  it('puts no data attributes on its element when unset', () => {
    render(<ThemeScope data-testid="scope" />);
    const scope = screen.getByTestId('scope');
    expect(scope).not.toHaveAttribute('data-theme');
    expect(scope).not.toHaveAttribute('data-mode');
  });

  it('renders the element given by as, with DOM props and ref', () => {
    const ref = createRef<HTMLElement>();
    render(
      <ThemeScope
        ref={ref}
        as="section"
        theme="clay"
        className="page"
        aria-label="Profile"
      />,
    );
    const scope = screen.getByRole('region', { name: 'Profile' });
    expect(scope.tagName).toBe('SECTION');
    expect(scope).toHaveClass('page');
    expect(scope).toHaveAttribute('data-theme', 'clay');
    expect(ref.current).toBe(scope);
  });

  it('puts its attributes, props and ref on the child with asChild', () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(
      <ThemeScope ref={ref} asChild theme="sage" className="scope">
        <main className="page" data-testid="page">
          Content
        </main>
      </ThemeScope>,
    );
    const page = screen.getByTestId('page');
    expect(container.firstElementChild).toBe(page);
    expect(page).toHaveAttribute('data-theme', 'sage');
    expect(page).toHaveClass('scope', 'page');
    expect(ref.current).toBe(page);
  });

  it('provides its theme and mode to the React tree', () => {
    render(
      <ThemeScope theme="harbor" mode="dark">
        <ScopeProbe />
      </ThemeScope>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('harbor/dark');
  });

  it('lets a nested scope override the theme and keep the mode', () => {
    render(
      <ThemeScope theme="harbor" mode="dark">
        <ThemeScope theme="clay">
          <ScopeProbe />
        </ThemeScope>
      </ThemeScope>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('clay/dark');
  });

  it('passes the enclosing theme on when its own is unset', () => {
    render(
      <ThemeScope theme="harbor">
        <ThemeScope data-testid="inner">
          <ScopeProbe />
        </ThemeScope>
      </ThemeScope>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('harbor/none');
    expect(screen.getByTestId('inner')).not.toHaveAttribute('data-theme');
  });

  it('reads as empty outside any scope', () => {
    render(<ScopeProbe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('none/none');
  });
});
