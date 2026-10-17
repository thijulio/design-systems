import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MultiSelect, type MultiSelectProps } from './MultiSelect';

const options = [
  { label: 'Cats', value: 'cats' },
  { label: 'Dogs', value: 'dogs' },
  { label: 'Birds', value: 'birds' },
];

const summarise = (labels: string[]) => `${labels.length} selected`;

const renderSelect = (props: Partial<MultiSelectProps> = {}) =>
  render(
    <MultiSelect
      placeholder="Pick animals"
      doneLabel="Done"
      options={options}
      value={[]}
      onChange={() => undefined}
      formatSummary={summarise}
      {...props}
    />,
  );

describe('MultiSelect', () => {
  it('names the trigger by the placeholder alone, without the decorative arrow', () => {
    renderSelect();
    const trigger = screen.getByRole('button', { name: 'Pick animals' });
    expect(trigger).not.toHaveAttribute('aria-haspopup');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('controls its popover and closes on Escape, handing focus back', () => {
    renderSelect();
    const trigger = screen.getByRole('button', { name: 'Pick animals' });
    fireEvent.click(trigger);
    const popoverId = trigger.getAttribute('aria-controls');
    expect(popoverId).toBeTruthy();
    expect(document.getElementById(popoverId as string)).toContainElement(
      screen.getByLabelText('Cats'),
    );

    fireEvent.keyDown(screen.getByLabelText('Cats'), { key: 'Escape' });

    expect(screen.queryByLabelText('Cats')).toBeNull();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('opens a popover of checkboxes and reports the toggled value', () => {
    const onChange = jest.fn();
    renderSelect({ onChange, value: ['dogs'] });

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: '1 selected' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByLabelText('Dogs')).toBeChecked();

    fireEvent.click(screen.getByLabelText('Cats'));
    expect(onChange).toHaveBeenLastCalledWith(['dogs', 'cats']);

    fireEvent.click(screen.getByLabelText('Dogs'));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('summarises the selected labels with the caller formatter', () => {
    const formatSummary = jest.fn(summarise);
    renderSelect({ value: ['birds', 'cats', 'unknown'], formatSummary });
    expect(formatSummary).toHaveBeenCalledWith(['Birds', 'Cats']);
    expect(
      screen.getByRole('button', { name: '2 selected' }),
    ).toBeInTheDocument();
  });

  it('falls back to the placeholder when no value matches an option', () => {
    renderSelect({ value: ['unknown'] });
    expect(
      screen.getByRole('button', { name: 'Pick animals' }),
    ).toBeInTheDocument();
  });

  it('closes on the done button and on a press outside', () => {
    render(
      <>
        <button type="button">Outside</button>
        <MultiSelect
          placeholder="Pick animals"
          doneLabel="Done"
          options={options}
          value={[]}
          onChange={() => undefined}
          formatSummary={summarise}
        />
      </>,
    );
    const trigger = screen.getByRole('button', { name: 'Pick animals' });

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByLabelText('Cats')).toBeNull();
    // The done button unmounted under focus: focus is back on the trigger.
    expect(trigger).toHaveFocus();

    fireEvent.click(trigger);
    fireEvent.mouseDown(screen.getByLabelText('Cats'));
    expect(screen.getByLabelText('Cats')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByLabelText('Cats')).toBeNull();
  });

  it('closes when focus moves out of the control, leaving focus where it went', () => {
    render(
      <>
        <MultiSelect
          placeholder="Pick animals"
          doneLabel="Done"
          options={options}
          value={[]}
          onChange={() => undefined}
          formatSummary={summarise}
        />
        <button type="button">After</button>
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Pick animals' }));
    const cats = screen.getByRole('checkbox', { name: 'Cats' });
    const done = screen.getByRole('button', { name: 'Done' });
    const after = screen.getByRole('button', { name: 'After' });

    fireEvent.blur(cats, { relatedTarget: done });
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();

    after.focus();
    fireEvent.blur(done, { relatedTarget: after });
    expect(screen.queryByRole('button', { name: 'Done' })).toBeNull();
    expect(after).toHaveFocus();
  });

  it('stays open when the window, not the control, loses focus', () => {
    renderSelect();
    fireEvent.click(screen.getByRole('button', { name: 'Pick animals' }));
    fireEvent.blur(screen.getByRole('checkbox', { name: 'Cats' }), {
      relatedTarget: null,
    });
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('names the control group by its label and describes the trigger by its hint', () => {
    renderSelect({ label: 'Animals', hint: 'Pick any' });
    expect(screen.getByRole('group', { name: 'Animals' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Pick animals' }),
    ).toHaveAccessibleDescription('Pick any');
  });

  it('renders no group without a label, and forwards rest props and a ref to the root', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <MultiSelect
        ref={ref}
        data-testid="animals"
        className="consumer"
        placeholder="Pick animals"
        doneLabel="Done"
        options={options}
        value={[]}
        onChange={() => undefined}
        formatSummary={summarise}
      />,
    );
    const root = screen.getByTestId('animals');
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('consumer');
    expect(root).not.toHaveAttribute('role');
    expect(screen.queryByRole('group')).toBeNull();
  });
});
