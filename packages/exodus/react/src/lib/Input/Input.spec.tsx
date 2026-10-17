import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, Textarea } from './Input';

describe('Input', () => {
  it('announces the invalid state without swallowing an explicit aria override', () => {
    const { rerender } = render(<Input invalid aria-label="Email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    rerender(<Input invalid aria-invalid="grammar" aria-label="Email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-invalid',
      'grammar',
    );
  });
  it('forwards value/onChange and arbitrary attributes', () => {
    const onChange = jest.fn();
    render(<Input placeholder="Email" onChange={onChange} />);
    const input = screen.getByPlaceholderText('Email');
    fireEvent.change(input, { target: { value: 'a@b.c' } });
    expect(onChange).toHaveBeenCalled();
  });
});

describe('Textarea', () => {
  it('announces invalid notes', () => {
    render(<Textarea invalid aria-label="Notes" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
  it('renders a textarea element', () => {
    render(<Textarea placeholder="Notes" />);
    expect(screen.getByPlaceholderText('Notes').tagName).toBe('TEXTAREA');
  });
  it('forwards a ref to the textarea', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="Notes" />);
    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Notes' }));
  });
});

describe('Input ref', () => {
  it('forwards a ref to the native input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="Email" />);
    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Email' }));
  });
});
