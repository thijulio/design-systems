import { render, screen } from '@testing-library/react';
import { Field } from './Field';

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
});
