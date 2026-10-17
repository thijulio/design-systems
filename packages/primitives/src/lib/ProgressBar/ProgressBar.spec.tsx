import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('is a progressbar named by its label, with its value and bounds', () => {
    render(<ProgressBar label="Upload progress" value={40} />);
    const bar = screen.getByRole('progressbar', { name: 'Upload progress' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).not.toHaveAttribute('aria-valuetext');
  });

  it('fills the track in proportion to value over max', () => {
    render(<ProgressBar label="Steps" value={3} max={4} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.style.getPropertyValue('--ds-progress-value')).toBe('75%');
  });

  it('clamps the value into range', () => {
    render(<ProgressBar label="Upload progress" value={140} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });

  it('is indeterminate without a value', () => {
    const formatValue = jest.fn(() => 'never');
    render(<ProgressBar label="Preparing" formatValue={formatValue} />);
    const bar = screen.getByRole('progressbar', { name: 'Preparing' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).not.toHaveAttribute('aria-valuetext');
    expect(bar).toHaveClass('indeterminate');
    expect(formatValue).not.toHaveBeenCalled();
  });

  it('shows and announces the formatted value', () => {
    render(
      <ProgressBar
        label="Download"
        value={3}
        max={12}
        formatValue={(value, max) => `${value} of ${max} MB`}
      />,
    );
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuetext', '3 of 12 MB');
    expect(screen.getByText('3 of 12 MB')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('is not in the tab order', () => {
    render(<ProgressBar label="Upload progress" value={10} />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('tabindex');
  });

  it('forwards ref and DOM props to the progressbar root', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ProgressBar
        ref={ref}
        label="Upload progress"
        value={10}
        className="extra"
        data-testid="bar"
      />,
    );
    const bar = screen.getByTestId('bar');
    expect(ref.current).toBe(bar);
    expect(bar).toHaveAttribute('role', 'progressbar');
    expect(bar).toHaveClass('progress', 'extra');
  });
});
