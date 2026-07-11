import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('exposes an accessible checkbox reflecting the checked prop', () => {
    render(<Checkbox checked label="Vaccinated" onChange={() => undefined} />);
    const box = screen.getByRole('checkbox');
    expect(box).toBeChecked();
    expect(screen.getByText('Vaccinated')).toBeInTheDocument();
  });

  it('fires onChange when toggled', () => {
    const onChange = jest.fn();
    render(<Checkbox checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
