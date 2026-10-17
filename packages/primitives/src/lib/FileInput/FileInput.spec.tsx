import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { FileInput, type FileInputProps } from './FileInput';

const renderPicker = (props: Partial<FileInputProps> = {}) =>
  render(
    <FileInput
      label="Photo"
      chooseLabel="Choose file"
      noFileLabel="No file chosen"
      name="photo"
      data-testid="photo-input"
      {...props}
    />,
  );

const pick = (name: string) => {
  const file = new File(['x'], name, { type: 'image/png' });
  fireEvent.change(screen.getByTestId('photo-input'), {
    target: { files: [file] },
  });
};

describe('FileInput', () => {
  it('names the native file input by the field label alone', () => {
    renderPicker();
    const input = screen.getByTestId('photo-input');
    expect(screen.getByLabelText('Photo')).toBe(input);
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('id', 'photo');
    expect(screen.getByText('Choose file')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('marks the drawn choose button inactive only while the input is disabled', () => {
    const { rerender } = renderPicker();
    expect(screen.getByText('Choose file')).not.toHaveAttribute(
      'aria-disabled',
    );
    rerender(
      <FileInput
        label="Photo"
        chooseLabel="Choose file"
        noFileLabel="No file chosen"
        name="photo"
        disabled
      />,
    );
    expect(screen.getByText('Choose file')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('shows the no-file text until a file is chosen, then the file name', () => {
    renderPicker();
    expect(screen.getByText('No file chosen')).toBeInTheDocument();

    pick('cat.png');

    expect(screen.getByText('cat.png')).toBeInTheDocument();
    expect(screen.queryByText('No file chosen')).toBeNull();
  });

  it('goes back to the no-file text when its form is reset', () => {
    render(
      <form data-testid="form">
        <FileInput
          label="Photo"
          chooseLabel="Choose file"
          noFileLabel="No file chosen"
          name="photo"
          data-testid="photo-input"
        />
      </form>,
    );
    pick('cat.png');
    expect(screen.getByText('cat.png')).toBeInTheDocument();

    fireEvent.reset(screen.getByTestId('form'));

    expect(screen.getByText('No file chosen')).toBeInTheDocument();
  });

  it('shows the caller text for a chosen file when it gives one', () => {
    renderPicker({ fileLabel: 'Selected: cat.png' });
    pick('cat.png');
    expect(screen.getByText('Selected: cat.png')).toBeInTheDocument();
  });

  it('hands the change event to the caller', () => {
    const onChange = jest.fn();
    renderPicker({ onChange });
    pick('cat.png');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('is described by the status line and the hint', () => {
    renderPicker({ hint: 'PNG, up to 5 MB' });
    const input = screen.getByTestId('photo-input');
    expect(input).toHaveAttribute(
      'aria-describedby',
      'photo-status photo-hint',
    );
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('marks the input invalid and links the announced error, replacing the hint', () => {
    renderPicker({ hint: 'PNG, up to 5 MB', error: 'Too large' });
    const input = screen.getByTestId('photo-input');
    const error = screen.getByRole('alert');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(error).toHaveAttribute('id', 'photo-error');
    expect(input.getAttribute('aria-describedby')).toContain(error.id);
    expect(screen.queryByText('PNG, up to 5 MB')).toBeNull();
  });

  it('puts wrapperClassName on the root and className on the input, and forwards a ref', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <FileInput
        ref={ref}
        label="Photo"
        chooseLabel="Choose file"
        noFileLabel="No file chosen"
        data-testid="photo-input"
        wrapperClassName="layout-slot"
        className="control-slot"
      />,
    );
    const input = screen.getByTestId('photo-input');
    expect(ref.current).toBe(input);
    expect(container.firstElementChild).toHaveClass('layout-slot');
    expect(container.firstElementChild?.tagName).toBe('DIV');
    expect(input).toHaveClass('control-slot');
    expect(input).not.toHaveClass('layout-slot');
  });
});
