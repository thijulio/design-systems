import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';

describe('Select', () => {
  it('renders options and fires onChange', () => {
    const onChange = jest.fn();
    render(
      <Select aria-label="Type" defaultValue="dog" onChange={onChange}>
        <option value="dog">Dog</option>
        <option value="cat">Cat</option>
      </Select>,
    );
    const select = screen.getByRole('combobox', { name: 'Type' });
    fireEvent.change(select, { target: { value: 'cat' } });
    expect(onChange).toHaveBeenCalled();
  });
});
