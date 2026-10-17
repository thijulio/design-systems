import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, Select, Textarea } from './Input';

describe('Input', () => {
  it('renders a textbox', () => {
    render(<Input placeholder="Nom du chat" />);
    expect(screen.getByPlaceholderText('Nom du chat')).toBeInTheDocument();
  });

  it('fires onChange as the user types', () => {
    const onChange = jest.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Rocket' },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('forwards a ref to the native input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="Name" />);
    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Name' }));
  });

  it('announces invalid and keeps a consumer className', () => {
    render(<Input invalid aria-label="Email" className="consumer" />);
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('consumer');
  });
});

describe('Textarea', () => {
  it('renders a textbox and forwards value', () => {
    render(<Textarea defaultValue="notes" />);
    expect(screen.getByRole('textbox')).toHaveValue('notes');
  });

  it('forwards a ref and announces invalid', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} invalid aria-label="Notes" />);
    const textarea = screen.getByRole('textbox', { name: 'Notes' });
    expect(ref.current).toBe(textarea);
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Select', () => {
  const options = (
    <>
      <option value="dog">Dog</option>
      <option value="cat">Cat</option>
    </>
  );

  it('renders a combobox and fires onChange with the picked value', () => {
    const onChange = jest.fn();
    render(
      <Select aria-label="Species" defaultValue="dog" onChange={onChange}>
        {options}
      </Select>,
    );
    const select = screen.getByRole('combobox', { name: 'Species' });
    fireEvent.change(select, { target: { value: 'cat' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(select).toHaveValue('cat');
  });

  it('exposes invalid as aria-invalid, letting an explicit value win', () => {
    const { rerender } = render(
      <Select aria-label="Species" invalid>
        {options}
      </Select>,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    rerender(
      <Select aria-label="Species" invalid aria-invalid={false}>
        {options}
      </Select>,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-invalid',
      'false',
    );
  });

  it('respects disabled', () => {
    render(
      <Select aria-label="Species" disabled>
        {options}
      </Select>,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('forwards a ref to the native select, not its wrapper', () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select aria-label="Species" ref={ref} fullWidth={false}>
        {options}
      </Select>,
    );
    expect(ref.current).toBe(screen.getByRole('combobox', { name: 'Species' }));
  });
});
