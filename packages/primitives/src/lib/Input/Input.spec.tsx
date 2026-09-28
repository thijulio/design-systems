import { render, screen, fireEvent } from '@testing-library/react';
import { Input, Textarea } from './Input';

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
});

describe('Textarea', () => {
  it('renders a textbox and forwards value', () => {
    render(<Textarea defaultValue="notes" />);
    expect(screen.getByRole('textbox')).toHaveValue('notes');
  });
});
