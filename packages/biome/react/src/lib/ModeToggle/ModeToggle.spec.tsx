import { render, screen, fireEvent } from '@testing-library/react';
import { ModeToggle } from './ModeToggle';

describe('ModeToggle', () => {
  it('renders a tablist with both postures', () => {
    render(<ModeToggle />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
  });

  it('marks the tab matching `value` as selected', () => {
    render(<ModeToggle value="recruiter" />);
    expect(screen.getByRole('tab', { name: 'Recruiter' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Explorer' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('calls onChange with the clicked mode', () => {
    const onChange = jest.fn();
    render(<ModeToggle value="explorer" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Recruiter' }));
    expect(onChange).toHaveBeenCalledWith('recruiter');
  });
});
