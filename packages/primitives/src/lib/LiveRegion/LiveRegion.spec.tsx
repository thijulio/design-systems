import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { LiveRegion } from './LiveRegion';
import hiddenStyles from '../VisuallyHidden/VisuallyHidden.module.css';

describe('LiveRegion', () => {
  it('is a polite, visually hidden status region by default', () => {
    render(<LiveRegion data-testid="region">3 results</LiveRegion>);
    const region = screen.getByRole('status');
    expect(region).toBe(screen.getByTestId('region'));
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).not.toHaveAttribute('aria-atomic');
    expect(region).toHaveClass(hiddenStyles.hidden);
    expect(region.tagName).toBe('DIV');
    expect(region).toHaveTextContent('3 results');
  });

  it('maps assertive to an alert region', () => {
    render(<LiveRegion politeness="assertive">Save failed</LiveRegion>);
    const region = screen.getByRole('alert');
    expect(region).toHaveAttribute('aria-live', 'assertive');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('lets an explicit role win over politeness', () => {
    render(<LiveRegion role="log">Entry added</LiveRegion>);
    expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('sets aria-atomic when asked', () => {
    const { rerender } = render(<LiveRegion atomic>Page 2 of 5</LiveRegion>);
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true');

    rerender(<LiveRegion atomic={false}>Page 2 of 5</LiveRegion>);
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'false');
  });

  it('can stay visible and render another element', () => {
    render(
      <LiveRegion as="p" visuallyHidden={false} className="extra">
        Saved
      </LiveRegion>,
    );
    const region = screen.getByRole('status');
    expect(region.tagName).toBe('P');
    expect(region).toHaveClass('extra');
    expect(region).not.toHaveClass(hiddenStyles.hidden);
  });

  it('keeps the same node while its text changes', () => {
    const { rerender } = render(<LiveRegion data-testid="region" />);
    const region = screen.getByTestId('region');
    expect(region).toBeEmptyDOMElement();

    rerender(<LiveRegion data-testid="region">Saving</LiveRegion>);
    expect(screen.getByTestId('region')).toBe(region);
    expect(region).toHaveTextContent('Saving');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLElement>();
    render(<LiveRegion ref={ref}>Done</LiveRegion>);
    expect(ref.current).toBe(screen.getByRole('status'));
  });
});
