import { createRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { RadioGroup, type RadioOption } from './RadioGroup';

const options: RadioOption[] = [
  { value: 'email', label: 'Email', testId: 'contact-email' },
  { value: 'phone', label: 'Phone', hint: 'Weekdays only' },
  { value: 'bird', label: 'Bird', disabled: true },
];

describe('RadioGroup', () => {
  it('renders named radios in a group named by the legend', () => {
    render(<RadioGroup name="species" legend="Species" options={options} />);
    expect(screen.getByRole('group', { name: 'Species' })).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    radios.forEach((radio) => expect(radio).toHaveAttribute('name', 'species'));
    expect(screen.getByTestId('contact-email')).toBe(
      screen.getByRole('radio', { name: 'Email' }),
    );
  });

  it('describes an option by its hint and disables options', () => {
    render(<RadioGroup name="species" legend="Species" options={options} />);
    expect(
      screen.getByRole('radio', { name: 'Phone' }),
    ).toHaveAccessibleDescription('Weekdays only');
    expect(screen.getByRole('radio', { name: 'Bird' })).toBeDisabled();
  });

  it('works uncontrolled from defaultValue', () => {
    const onChange = jest.fn();
    render(
      <RadioGroup
        name="species"
        legend="Species"
        options={options}
        defaultValue="phone"
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Phone' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Email' }));
    expect(screen.getByRole('radio', { name: 'Email' })).toBeChecked();
    expect(onChange).toHaveBeenCalledWith('email');
  });

  it('works controlled from value', () => {
    const Harness = () => {
      const [value, setValue] = useState('email');
      return (
        <RadioGroup
          name="species"
          legend="Species"
          options={options}
          value={value}
          onChange={setValue}
        />
      );
    };
    render(<Harness />);
    expect(screen.getByRole('radio', { name: 'Email' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Phone' }));
    expect(screen.getByRole('radio', { name: 'Phone' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Email' })).not.toBeChecked();
  });

  it('names a radio by its label line and describes it by its description', () => {
    render(
      <RadioGroup
        name="plan"
        legend="Plan"
        options={[
          {
            value: 'monthly',
            label: 'Monthly',
            description: 'Cancel any time',
            labelTestId: 'plan-monthly',
          },
        ]}
      />,
    );
    const radio = screen.getByRole('radio', { name: 'Monthly' });
    expect(radio).toHaveAccessibleDescription('Cancel any time');
    expect(screen.getByTestId('plan-monthly').tagName).toBe('LABEL');
    expect(screen.getByTestId('plan-monthly')).toContainElement(radio);
  });

  it('draws card options and selects one by a click on the card', () => {
    const onChange = jest.fn();
    render(
      <RadioGroup
        name="species"
        legend="Species"
        variant="card"
        options={options.map((option) => ({
          ...option,
          labelTestId: `card-${option.value}`,
        }))}
        value=""
        onChange={onChange}
      />,
    );
    const card = screen.getByTestId('card-phone');
    expect(card).toHaveClass('card');
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    screen
      .getAllByRole('radio')
      .forEach((radio) => expect(radio).not.toBeChecked());
    fireEvent.click(screen.getByText('Weekdays only'));
    expect(onChange).toHaveBeenCalledWith('phone');
  });

  it('keeps the default variant free of card styling', () => {
    render(
      <RadioGroup
        name="species"
        legend="Species"
        options={[{ ...options[0], labelTestId: 'plain-email' }]}
      />,
    );
    expect(screen.getByTestId('plain-email')).not.toHaveClass('card');
  });

  it('shows the error as an alert and forwards ref', () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(
      <RadioGroup
        ref={ref}
        name="species"
        legend="Species"
        options={options}
        error="Choose a species"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a species');
    expect(ref.current).toBe(screen.getByRole('group'));
  });
});
