import { createRef, type MouseEvent } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SkipLink } from './SkipLink';
import styles from './SkipLink.module.css';
import hiddenStyles from '../VisuallyHidden/VisuallyHidden.module.css';

const renderShell = (main = <main id="main-content">Content</main>) =>
  render(
    <>
      <SkipLink href="#main-content" label="Skip to content" />
      <button type="button">Menu</button>
      {main}
    </>,
  );

describe('SkipLink', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('is a link to the target, clipped until it takes focus', () => {
    renderShell();
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).toHaveAttribute('href', '#main-content');
    expect(link).toHaveClass(styles.skipLink, hiddenStyles.focusable);
    expect(link).not.toHaveClass(hiddenStyles.hidden);
  });

  it('moves focus to the target and records the fragment', () => {
    renderShell();
    fireEvent.click(screen.getByRole('link', { name: 'Skip to content' }));
    const main = screen.getByRole('main');
    expect(main).toHaveFocus();
    expect(main).toHaveAttribute('tabindex', '-1');
    expect(window.location.hash).toBe('#main-content');
  });

  it('keeps a tabindex the target already has', () => {
    renderShell(
      <main id="main-content" tabIndex={0}>
        Content
      </main>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Skip to content' }));
    expect(screen.getByRole('main')).toHaveFocus();
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '0');
  });

  it('lets a handler opt out with preventDefault', () => {
    const onClick = jest.fn((event: MouseEvent) => event.preventDefault());
    render(
      <>
        <SkipLink href="#main-content" label="Skip" onClick={onClick} />
        <main id="main-content">Content</main>
      </>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Skip' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('main')).not.toHaveFocus();
    expect(screen.getByRole('main')).not.toHaveAttribute('tabindex');
  });

  it('passes other attributes and forwards ref', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <SkipLink
        ref={ref}
        href="#main"
        label="Skip"
        data-testid="skip"
        className="extra"
      />,
    );
    expect(ref.current).toBe(screen.getByTestId('skip'));
    expect(ref.current).toHaveClass('extra', styles.skipLink);
  });
});
