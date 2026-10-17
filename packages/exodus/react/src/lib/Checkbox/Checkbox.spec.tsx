import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('exposes an accessible checkbox reflecting the checked prop', () => {
    render(<Checkbox checked label="Vaccinated" onChange={() => undefined} />);
    const box = screen.getByRole('checkbox', { name: 'Vaccinated' });
    expect(box).toBeChecked();
  });

  it('fires onChange when toggled', () => {
    const onChange = jest.fn();
    render(<Checkbox checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('works uncontrolled from defaultChecked', () => {
    render(<Checkbox defaultChecked label="Microchipped" />);
    const box = screen.getByRole('checkbox', { name: 'Microchipped' });
    expect(box).toBeChecked();
    fireEvent.click(box);
    expect(box).not.toBeChecked();
  });

  it('toggles when its label text is clicked', () => {
    render(<Checkbox label="Neutered" />);
    fireEvent.click(screen.getByText('Neutered'));
    expect(screen.getByRole('checkbox', { name: 'Neutered' })).toBeChecked();
  });

  it('keeps the native input focusable and forwards a ref to it', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} label="Vaccinated" name="vaccinated" />);
    const box = screen.getByRole('checkbox', { name: 'Vaccinated' });
    expect(ref.current).toBe(box);
    expect(box).toHaveAttribute('name', 'vaccinated');
    box.focus();
    expect(box).toHaveFocus();
  });

  it('respects disabled', () => {
    render(<Checkbox disabled label="Archived" />);
    expect(screen.getByRole('checkbox', { name: 'Archived' })).toBeDisabled();
  });

  it('names the box by its label and describes it by the description', () => {
    render(
      <Checkbox
        id="terms"
        label="I accept the terms"
        description="Kept for twelve months."
      />,
    );
    const box = screen.getByRole('checkbox', { name: 'I accept the terms' });
    expect(box).toHaveAccessibleDescription('Kept for twelve months.');
    expect(box).toHaveAttribute('aria-describedby', 'terms-hint');
  });

  it('never takes its name from the description when there is no label', () => {
    render(<Checkbox id="terms" description="Kept for twelve months." />);
    const box = screen.getByRole('checkbox');
    expect(box).toHaveAccessibleName('');
    expect(box).toHaveAccessibleDescription('Kept for twelve months.');
  });

  it('still toggles from its box and takes labelTestId without a label', () => {
    render(
      <Checkbox
        aria-label="Accept the terms"
        description="Kept for twelve months."
        labelTestId="root"
      />,
    );
    const box = screen.getByRole('checkbox', { name: 'Accept the terms' });
    fireEvent.click(box);
    expect(box).toBeChecked();
    expect(screen.getByTestId('root')).toContainElement(box);
  });

  it('takes its name from aria-label when there is a description and no label', () => {
    render(
      <Checkbox
        aria-label="Accept the terms"
        description="Kept for twelve months."
      />,
    );
    const box = screen.getByRole('checkbox', { name: 'Accept the terms' });
    expect(box).toHaveAccessibleDescription('Kept for twelve months.');
  });

  it('takes its name from aria-labelledby when there is a description and no label', () => {
    render(
      <>
        <h2 id="consent-heading">Consent</h2>
        <Checkbox
          aria-labelledby="consent-heading"
          description="Kept for twelve months."
        />
      </>,
    );
    const box = screen.getByRole('checkbox', { name: 'Consent' });
    expect(box).toHaveAccessibleDescription('Kept for twelve months.');
  });

  it('toggles when its description text is clicked', () => {
    render(<Checkbox label="Subscribe" description="One email a week." />);
    fireEvent.click(screen.getByText('One email a week.'));
    expect(screen.getByRole('checkbox', { name: 'Subscribe' })).toBeChecked();
  });

  it('keeps a caller aria-describedby beside the description', () => {
    render(
      <Checkbox
        id="news"
        label="Subscribe"
        description="One email a week."
        aria-describedby="news-error"
      />,
    );
    expect(screen.getByRole('checkbox')).toHaveAttribute(
      'aria-describedby',
      'news-hint news-error',
    );
  });

  it('adds no description wiring without a description', () => {
    render(<Checkbox label="Subscribe" />);
    const box = screen.getByRole('checkbox', { name: 'Subscribe' });
    expect(box).not.toHaveAttribute('aria-describedby');
    expect(box).not.toHaveAttribute('aria-labelledby');
  });

  it('puts the box at the top with align="start"', () => {
    render(<Checkbox label="Subscribe" align="start" labelTestId="root" />);
    const root = screen.getByTestId('root');
    expect(root.tagName).toBe('LABEL');
    expect(root).toHaveClass('start');
  });

  it('puts labelTestId on the root label and data-testid on the input', () => {
    render(
      <Checkbox
        label="Subscribe"
        description="One email a week."
        labelTestId="consent-label"
        data-testid="consent"
      />,
    );
    expect(screen.getByTestId('consent-label')).toHaveTextContent(
      'SubscribeOne email a week.',
    );
    expect(screen.getByTestId('consent')).toBe(screen.getByRole('checkbox'));
  });
});
