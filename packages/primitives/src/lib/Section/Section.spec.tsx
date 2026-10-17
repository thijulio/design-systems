import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Section } from './Section';
import styles from './Section.module.css';
import stackStyles from '../Stack/Stack.module.css';

describe('Section', () => {
  it('renders a section with a level-2 heading by default', () => {
    const { container } = render(<Section title="Orders">Body</Section>);
    expect(container.firstElementChild?.tagName).toBe('SECTION');
    expect(
      screen.getByRole('heading', { level: 2, name: 'Orders' }),
    ).toBeInTheDocument();
  });

  it('renders description, actions and the heading level', () => {
    render(
      <Section
        title="Orders"
        description="Recent orders"
        actions={<button type="button">Add</button>}
        headingLevel={3}
      >
        Body
      </Section>,
    );
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    expect(screen.getByText('Recent orders')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('renders no header without title, description or actions', () => {
    const { container } = render(
      <Section>
        <p>Only child</p>
      </Section>,
    );
    expect(screen.queryByRole('heading')).toBeNull();
    expect(container.firstElementChild?.children).toHaveLength(1);
  });

  it('maps surface, padding and gap', () => {
    const { container, rerender } = render(
      <Section surface="raised" gap={6} />,
    );
    const root = container.firstElementChild;
    expect(root).toHaveClass(styles.raised, styles.padMd, stackStyles.g6);

    rerender(<Section padding="lg" />);
    expect(root).toHaveClass(styles.plain, styles.padLg);
  });

  it('maps the wash band (unpadded) and the accent panel', () => {
    const { container, rerender } = render(<Section surface="wash" />);
    const root = container.firstElementChild;
    expect(root).toHaveClass(styles.wash);
    expect(root).not.toHaveClass(styles.padMd);

    rerender(<Section surface="accent" padding="xl" />);
    expect(root).toHaveClass(styles.accent, styles.padXl);
    expect(root).not.toHaveClass(styles.wash);
  });

  it('honours `as`, ref and DOM props', () => {
    const ref = createRef<HTMLElement>();
    render(<Section as="div" ref={ref} data-testid="block" />);
    const root = screen.getByTestId('block');
    expect(root.tagName).toBe('DIV');
    expect(ref.current).toBe(root);
  });
});
