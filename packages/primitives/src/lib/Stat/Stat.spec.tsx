import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Stat } from './Stat';
import styles from './Stat.module.css';

describe('Stat', () => {
  it('renders label, value and caption', () => {
    render(<Stat label="Pending reports" value={12} caption="Last 7 days" />);
    expect(screen.getByText('Pending reports')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
  });

  it('omits the caption when absent and maps the tone', () => {
    const { container } = render(<Stat label="Errors" value={3} tone="danger" />);
    expect(container.querySelectorAll('p')).toHaveLength(2);
    expect(container.firstElementChild).toHaveClass(styles.danger);
  });

  it('renders a dt and dd group for a parent dl', () => {
    const { container } = render(
      <dl>
        <Stat markup="dl" label="Created" value={4} caption="Rows" />
      </dl>,
    );
    const group = container.querySelector('dl > div');
    expect(group).not.toBeNull();
    expect(group?.querySelector(':scope > dt')).toHaveTextContent('Created');
    const details = group?.querySelectorAll(':scope > dd');
    expect(details).toHaveLength(2);
    expect(details?.[0]).toHaveTextContent('4');
    expect(details?.[1]).toHaveTextContent('Rows');
    expect(container.querySelector('p')).toBeNull();
  });

  it('puts valueTestId on the value element only', () => {
    render(<Stat label="Errors" value={3} valueTestId="errors-count" />);
    const value = screen.getByTestId('errors-count');
    expect(value).toHaveTextContent(/^3$/);
    expect(value).toHaveClass(styles.value);
  });

  it('renders the label as a heading at headingLevel', () => {
    render(
      <Stat label="Reviews" value={12} caption="Total" headingLevel={3} />,
    );
    const heading = screen.getByRole('heading', { level: 3, name: 'Reviews' });
    expect(heading).toHaveClass(styles.label, styles.heading);
    expect(screen.getByText('12').tagName).toBe('P');
  });

  it('keeps a paragraph label by default, and a dt in a dl', () => {
    const { rerender } = render(<Stat label="Reviews" value={12} />);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('Reviews')).not.toHaveClass(styles.heading);
    rerender(
      <dl>
        <Stat markup="dl" label="Reviews" value={12} headingLevel={3} />
      </dl>,
    );
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('Reviews').tagName).toBe('DT');
  });

  it('keeps the stacked layout by default and maps inline', () => {
    const { container, rerender } = render(<Stat label="A" value="1" />);
    expect(container.firstElementChild).not.toHaveClass(styles.inline);
    rerender(<Stat label="A" value="1" layout="inline" />);
    expect(container.firstElementChild).toHaveClass(styles.inline);
  });

  it('forwards ref and DOM props', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Stat ref={ref} label="A" value="1" data-testid="stat" />);
    expect(ref.current).toBe(screen.getByTestId('stat'));
  });
});
