import { createRef } from 'react';
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

  it('forwards a ref to the native select and announces invalid', () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select aria-label="Type" ref={ref} invalid>
        <option value="dog">Dog</option>
      </Select>,
    );
    const select = screen.getByRole('combobox', { name: 'Type' });
    expect(ref.current).toBe(select);
    expect(select).toHaveAttribute('aria-invalid', 'true');
  });
});
