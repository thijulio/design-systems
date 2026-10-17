import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Disclosure } from './Disclosure';
import styles from './Disclosure.module.css';

/** Simulate the browser toggling a <details> (jsdom does not on summary click). */
function toggle(details: HTMLDetailsElement, open: boolean) {
  details.open = open;
  fireEvent(details, new Event('toggle'));
}

describe('Disclosure', () => {
  it('renders native details/summary, closed by default', () => {
    const { container } = render(
      <Disclosure summary="Health records">Vaccines</Disclosure>,
    );
    const details = container.querySelector('details');
    expect(details).not.toBeNull();
    expect(details?.open).toBe(false);
    expect(container.querySelector('summary')).toHaveTextContent(
      'Health records',
    );
  });

  it('starts open with defaultOpen and reports toggles', () => {
    const onToggle = jest.fn();
    const { container } = render(
      <Disclosure summary="Health" defaultOpen onToggle={onToggle}>
        Vaccines
      </Disclosure>,
    );
    const details = container.querySelector('details') as HTMLDetailsElement;
    expect(details.open).toBe(true);

    toggle(details, false);
    expect(onToggle).toHaveBeenCalledWith(false);
    expect(details.open).toBe(false);
  });

  it('follows the open prop when controlled', () => {
    const { container, rerender } = render(
      <Disclosure summary="Health" open={false}>
        Vaccines
      </Disclosure>,
    );
    const details = container.querySelector('details') as HTMLDetailsElement;
    expect(details.open).toBe(false);
    rerender(
      <Disclosure summary="Health" open>
        Vaccines
      </Disclosure>,
    );
    expect(details.open).toBe(true);
  });

  it('hides the chevron from assistive technology and forwards ref', () => {
    const ref = createRef<HTMLDetailsElement>();
    const { container } = render(
      <Disclosure ref={ref} summary="Health">
        Vaccines
      </Disclosure>,
    );
    expect(ref.current).toBe(container.querySelector('details'));
    expect(container.querySelector('summary svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.getByText('Vaccines')).toBeInTheDocument();
  });

  it('renders summaryEnd inside the summary, after the text', () => {
    const { container } = render(
      <Disclosure summary="Health" summaryEnd={<span>Chip 123</span>}>
        Vaccines
      </Disclosure>,
    );
    const summary = container.querySelector('summary');
    expect(summary).toHaveTextContent('HealthChip 123');
  });

  it('adds the plain variant class only when asked', () => {
    const { container, rerender } = render(
      <Disclosure summary="History">Events</Disclosure>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toHaveClass(styles.plain);
    rerender(
      <Disclosure summary="History" variant="plain">
        Events
      </Disclosure>,
    );
    expect(root).toHaveClass(styles.disclosure, styles.plain);
    expect(container.querySelector('summary')).not.toBeNull();
  });

  describe('with headingLevel (accordion)', () => {
    it('wraps a toggle button in the heading and hides the region', () => {
      const { container } = render(
        <Disclosure headingLevel={3} summary="Health" summaryEnd="Chip">
          Vaccines
        </Disclosure>,
      );
      expect(container.querySelector('details')).toBeNull();
      const heading = screen.getByRole('heading', { level: 3 });
      const button = screen.getByRole('button', { name: /^Health/ });
      expect(heading).toContainElement(button);
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      const region = document.getElementById(
        button.getAttribute('aria-controls') ?? '',
      );
      expect(region).toHaveTextContent('Vaccines');
      expect(region).not.toBeVisible();
    });

    it('toggles on click when uncontrolled and reports it', () => {
      const onToggle = jest.fn();
      render(
        <Disclosure headingLevel={4} summary="Health" onToggle={onToggle}>
          Vaccines
        </Disclosure>,
      );
      const button = screen.getByRole('button', { name: 'Health' });
      fireEvent.click(button);
      expect(onToggle).toHaveBeenCalledWith(true);
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Vaccines')).toBeVisible();
    });

    it('follows the open prop when controlled and forwards ref', () => {
      const onToggle = jest.fn();
      const ref = createRef<HTMLElement>();
      const { container } = render(
        <Disclosure
          ref={ref}
          headingLevel={2}
          summary="Health"
          open={false}
          onToggle={onToggle}
        >
          Vaccines
        </Disclosure>,
      );
      expect(ref.current).toBe(container.firstElementChild);
      const button = screen.getByRole('button', { name: 'Health' });
      fireEvent.click(button);
      expect(onToggle).toHaveBeenCalledWith(true);
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button.querySelector('svg')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
    });
  });
});
