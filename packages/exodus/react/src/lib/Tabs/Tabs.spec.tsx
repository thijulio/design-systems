import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from './Tabs';

const tabs = [
  { value: 'all', label: 'All', count: 12 },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived', disabled: true },
];

describe('Tabs', () => {
  it('marks the selected tab and renders count chips', () => {
    render(<Tabs tabs={tabs} value="all" />);
    expect(screen.getByRole('tab', { name: /All/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('calls onChange for enabled tabs but not disabled ones', () => {
    const onChange = jest.fn();
    render(<Tabs tabs={tabs} value="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Active' }));
    expect(onChange).toHaveBeenCalledWith('active');

    fireEvent.click(screen.getByRole('tab', { name: 'Archived' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
