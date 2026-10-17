import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Fieldset } from './Fieldset';
import styles from './Fieldset.module.css';

describe('Fieldset', () => {
  it('is a group named by its legend', () => {
    render(
      <Fieldset legend="Contact preference">
        <input aria-label="Email" />
      </Fieldset>,
    );
    expect(screen.getByRole('group', { name: 'Contact preference' })).toBeInTheDocument();
  });

  it('is described by its hint and error, and marks itself invalid', () => {
    render(
      <Fieldset legend="Species" hint="Pick one" error="Required">
        <input aria-label="Email" type="checkbox" />
      </Fieldset>,
    );
    const group = screen.getByRole('group', { name: 'Species' });
    expect(group).toHaveAccessibleDescription('Pick one Required');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('has no description or invalid state without hint and error', () => {
    render(<Fieldset legend="Species" />);
    const group = screen.getByRole('group');
    expect(group).not.toHaveAttribute('aria-describedby');
    expect(group).not.toHaveAttribute('aria-invalid');
  });

  it('can visually hide the legend while keeping the name', () => {
    render(<Fieldset legend="Filters" legendHidden />);
    expect(screen.getByRole('group', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByText('Filters')).toHaveClass(styles.visuallyHidden);
  });

  it('forwards ref, disabled and DOM props', () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(<Fieldset ref={ref} legend="Group" disabled data-testid="fs" />);
    expect(ref.current).toBe(screen.getByTestId('fs'));
    expect(ref.current).toBeDisabled();
  });
});
