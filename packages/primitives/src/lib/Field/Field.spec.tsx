import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Field } from './Field';

describe('Field', () => {
  it('labels the control with the label text alone', () => {
    render(
      <Field label="Email" htmlFor="email" hint="Use your work email">
        <input id="email" />
      </Field>,
    );
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute(
      'id',
      'email',
    );
    expect(screen.getByText('Use your work email')).toHaveAttribute(
      'id',
      'email-hint',
    );
    expect(screen.getByText('Use your work email').closest('label')).toBeNull();
  });

  it('replaces the hint with an announced error', () => {
    render(
      <Field label="Email" htmlFor="email" hint="Hint" error="Required">
        <input id="email" />
      </Field>,
    );
    const error = screen.getByRole('alert');
    expect(error).toHaveAttribute('id', 'email-error');
    expect(error).toHaveTextContent('Required');
    expect(screen.queryByText('Hint')).toBeNull();
  });

  it('shows a decorative required marker only when asked', () => {
    const { rerender } = render(
      <Field label="Name" htmlFor="name">
        <input id="name" required />
      </Field>,
    );
    expect(screen.queryByText('*')).toBeNull();
    rerender(
      <Field label="Name" htmlFor="name" requiredMarker>
        <input id="name" required />
      </Field>,
    );
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeRequired();
  });

  it('renders no label without one, and puts className and the ref on the div', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Field ref={ref} className="slot" data-testid="field">
        <input aria-label="Search" />
      </Field>,
    );
    const root = screen.getByTestId('field');
    expect(container.querySelector('label')).toBeNull();
    expect(ref.current).toBe(root);
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveClass('slot');
  });
});
