import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { InputField, SelectField, TextareaField } from './InputField';

const options = (
  <>
    <option value="dog">Dog</option>
    <option value="cat">Cat</option>
  </>
);

describe('InputField', () => {
  it('names the input by its label alone, the hint describing it', () => {
    render(<InputField label="Email" name="email" hint="Use your work email" />);
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('id', 'email');
    expect(input).toHaveAccessibleDescription('Use your work email');
    expect(input).toHaveAttribute('aria-describedby', 'email-hint');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.getByText('Use your work email').closest('label')).toBeNull();
  });

  it('marks the input invalid and links the announced error, which replaces the hint', () => {
    render(
      <InputField label="Email" name="email" hint="Hint" error="Required" />,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    const error = screen.getByRole('alert');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(error).toHaveAttribute('id', 'email-error');
    expect(input).toHaveAttribute('aria-describedby', error.id);
    expect(error).toHaveTextContent('Required');
    expect(screen.queryByText('Hint')).toBeNull();
  });

  it('prefers id over name and generates one without either', () => {
    const { rerender } = render(
      <InputField label="Email" id="contact-email" name="email" />,
    );
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute(
      'id',
      'contact-email',
    );
    rerender(<InputField label="Email" />);
    expect(screen.getByRole('textbox', { name: 'Email' }).id).not.toBe('');
  });

  it('renders no label element without a label', () => {
    const { container } = render(
      <InputField aria-label="Search" name="query" />,
    );
    expect(container.querySelector('label')).toBeNull();
    expect(
      screen.getByRole('textbox', { name: 'Search' }),
    ).toBeInTheDocument();
  });

  it('puts wrapperClassName on the div root and className on the control', () => {
    const { container } = render(
      <InputField
        label="Coat"
        wrapperClassName="layout-slot"
        className="control-slot"
      />,
    );
    const root = container.firstElementChild;
    const input = screen.getByRole('textbox');
    expect(root?.tagName).toBe('DIV');
    expect(root).toHaveClass('layout-slot');
    expect(root).not.toHaveClass('control-slot');
    expect(root).toContainElement(input);
    expect(input).toHaveClass('control-slot');
    expect(input).not.toHaveClass('layout-slot');
  });

  it('lets a caller describedby replace the computed one and forwards a ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <InputField
        ref={ref}
        label="Note"
        name="note"
        hint="Private"
        aria-describedby="note-context"
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Note' });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('aria-describedby', 'note-context');
  });

  it('shows the required marker only when asked', () => {
    const { rerender } = render(<InputField label="Name" required />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeRequired();
    expect(screen.queryByText('*')).toBeNull();
    rerender(<InputField label="Name" required requiredMarker />);
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('SelectField', () => {
  it('names the select by its label, without the decorative chevron', () => {
    render(
      <SelectField label="Species" name="species" hint="Choose one">
        {options}
      </SelectField>,
    );
    const select = screen.getByRole('combobox', { name: 'Species' });
    expect(select).toHaveAttribute('aria-describedby', 'species-hint');
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('links the error and keeps wrapperClassName off the chevron wrapper', () => {
    const ref = createRef<HTMLSelectElement>();
    const { container } = render(
      <SelectField
        ref={ref}
        label="Species"
        name="species"
        error="Required"
        wrapperClassName="layout-slot"
      >
        {options}
      </SelectField>,
    );
    const select = screen.getByRole('combobox', { name: 'Species' });
    expect(ref.current).toBe(select);
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAttribute('aria-describedby', 'species-error');
    expect(container.firstElementChild).toHaveClass('layout-slot');
    expect(select.parentElement).not.toHaveClass('layout-slot');
  });
});

describe('TextareaField', () => {
  it('names the textarea by its label and links the announced error', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(
      <TextareaField
        ref={ref}
        label="Description"
        name="description"
        error="Required"
      />,
    );
    const textarea = screen.getByRole('textbox', { name: 'Description' });
    expect(ref.current).toBe(textarea);
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute(
      'aria-describedby',
      screen.getByRole('alert').id,
    );
  });

  it('links a hint while there is no error', () => {
    render(
      <TextareaField
        label="Description"
        name="description"
        hint="Two lines at most"
      />,
    );
    expect(
      screen.getByRole('textbox', { name: 'Description' }),
    ).toHaveAttribute('aria-describedby', 'description-hint');
  });
});
