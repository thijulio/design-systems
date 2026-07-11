import { render, screen, fireEvent } from '@testing-library/react';
import { Input, Textarea } from './Input';

describe('Input', () => {
  it('forwards value/onChange and arbitrary attributes', () => {
    const onChange = jest.fn();
    render(<Input placeholder="Email" onChange={onChange} />);
    const input = screen.getByPlaceholderText('Email');
    fireEvent.change(input, { target: { value: 'a@b.c' } });
    expect(onChange).toHaveBeenCalled();
  });
});

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea placeholder="Notes" />);
    expect(screen.getByPlaceholderText('Notes').tagName).toBe('TEXTAREA');
  });
});
