import { createRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { HoneypotField } from './HoneypotField';
import styles from './HoneypotField.module.css';

function Controlled() {
  const [value, setValue] = useState('');
  return (
    <form aria-label="Contact">
      <HoneypotField
        name="website"
        label="Website"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        data-testid="trap"
      />
      <output data-testid="echo">{value}</output>
    </form>
  );
}

describe('HoneypotField', () => {
  it('is a labelled text input out of the tab order', () => {
    render(<HoneypotField name="website" label="Website" data-testid="trap" />);
    const input = screen.getByTestId('trap');
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('name', 'website');
    expect(input).toHaveAttribute('tabindex', '-1');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(screen.getByText('Website')).toHaveAttribute('for', input.id);
  });

  it('is hidden from assistive technology but not display:none', () => {
    render(<HoneypotField name="website" label="Website" data-testid="trap" />);
    const root = screen.getByTestId('trap').parentElement;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).toHaveClass(styles.honeypot);
    expect(root).not.toHaveAttribute('hidden');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByLabelText('Website')).not.toBeNull();
  });

  it('reports a filled value through a controlled onChange', () => {
    render(<Controlled />);
    fireEvent.change(screen.getByTestId('trap'), {
      target: { value: 'bot' },
    });
    expect(screen.getByTestId('echo')).toHaveTextContent('bot');
  });

  it('keeps a given id and wrapper class, and forwards ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <HoneypotField
        ref={ref}
        id="trap-id"
        name="website"
        label="Website"
        wrapperClassName="extra"
        className="field"
      />,
    );
    expect(ref.current).toHaveAttribute('id', 'trap-id');
    expect(ref.current).toHaveClass('field');
    expect(ref.current?.parentElement).toHaveClass('extra', styles.honeypot);
  });
});
