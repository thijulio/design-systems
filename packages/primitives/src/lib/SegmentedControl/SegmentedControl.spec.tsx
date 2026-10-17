import { createRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SegmentedControl } from './SegmentedControl';

const options = [
  { value: 'all', label: 'All', testId: 'type-all' },
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
];

describe('SegmentedControl', () => {
  it('is a labelled group of buttons with aria-pressed', () => {
    render(
      <SegmentedControl
        label="Owner type"
        options={options}
        value="list"
        onChange={() => undefined}
      />,
    );
    expect(
      screen.getByRole('group', { name: 'Owner type' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByTestId('type-all')).toHaveAttribute('type', 'button');
  });

  it('calls onChange with the chosen value', () => {
    const Harness = () => {
      const [value, setValue] = useState('all');
      return (
        <SegmentedControl
          label="Owner type"
          options={options}
          value={value}
          onChange={setValue}
        />
      );
    };
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Grid' }));
    expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('submits the value through a hidden input when named', () => {
    const { container } = render(
      <SegmentedControl
        label="Owner type"
        options={options}
        value="all"
        onChange={() => undefined}
        name="ownerType"
      />,
    );
    expect(container.querySelector('input[type="hidden"]')).toHaveAttribute(
      'name',
      'ownerType',
    );
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <SegmentedControl
        ref={ref}
        label="Owner type"
        options={options}
        value="all"
        onChange={() => undefined}
      />,
    );
    expect(ref.current).toBe(screen.getByRole('group'));
  });
});
