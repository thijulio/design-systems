import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Field, fieldDescribedBy, fieldErrorId, fieldHintId } from './Field';

describe('Field', () => {
  it('shows the hint when there is no error', () => {
    render(
      <Field label="Name" hint="As it appears on records">
        <input />
      </Field>,
    );
    expect(screen.getByText('As it appears on records')).toBeInTheDocument();
  });

  it('replaces the hint with the error when present', () => {
    render(
      <Field label="Name" hint="ignored" error="Required">
        <input />
      </Field>,
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.queryByText('ignored')).toBeNull();
  });

  it('labels the control without leaking hint or error into its name', () => {
    render(
      <Field label="Name" htmlFor="name" hint="As on records" required>
        <input id="name" aria-describedby={fieldHintId('name')} />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveAccessibleDescription('As on records');
    expect(screen.getByText('As on records')).toHaveAttribute(
      'id',
      'name-hint',
    );
    expect(screen.getByText('As on records').closest('label')).toBeNull();
  });

  it('renders the error with an id and role="alert"', () => {
    render(
      <Field label="Email" htmlFor="email" error="Enter an email">
        <input id="email" aria-describedby={fieldErrorId('email')} />
      </Field>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Enter an email');
    expect(alert).toHaveAttribute('id', 'email-error');
    expect(
      screen.getByRole('textbox', { name: 'Email' }),
    ).toHaveAccessibleDescription('Enter an email');
  });

  it('renders no label element without a label, a div root and forwards a ref', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Field ref={ref} data-testid="field">
        <input aria-label="Search" />
      </Field>,
    );
    expect(container.querySelector('label')).toBeNull();
    expect(ref.current).toBe(screen.getByTestId('field'));
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('exposes the id helpers', () => {
    expect(fieldHintId('dob')).toBe('dob-hint');
    expect(fieldErrorId('dob')).toBe('dob-error');
    expect(fieldDescribedBy('dob', { error: 'Required', hint: 'DD/MM' })).toBe(
      'dob-error',
    );
    expect(fieldDescribedBy('dob', { hint: 'DD/MM' })).toBe('dob-hint');
    expect(fieldDescribedBy('dob')).toBeUndefined();
  });
});
