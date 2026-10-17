import { createRef, useRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeScope } from '../ThemeScope/ThemeScope';
import { Dialog } from './Dialog';

// The behaviour contract consumers' modal wrappers rely on: opener focus
// restore, focus trap, Escape and backdrop close, portal.

const OpenerHarness = ({ mountOnOpen }: { mountOnOpen: boolean }) => {
  const [open, setOpen] = useState(false);
  const dialog = (
    <Dialog
      closeLabel="Close"
      open={open}
      title="Details"
      onClose={() => setOpen(false)}
    >
      <input aria-label="Name" />
    </Dialog>
  );
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {mountOnOpen ? open && dialog : dialog}
    </>
  );
};

const FieldsDialog = ({ onClose }: { onClose: () => void }) => (
  <Dialog
    closeLabel="Close"
    open
    title="Details"
    onClose={onClose}
    footer={<button>Save</button>}
  >
    <input aria-label="Name" />
    <button disabled>Unavailable</button>
    <input aria-label="Honeypot" tabIndex={-1} />
  </Dialog>
);

describe('Dialog', () => {
  describe('render output', () => {
    test('does not render when closed', () => {
      render(
        <Dialog
          closeLabel="Close"
          open={false}
          title="Details"
          onClose={() => undefined}
        >
          Content
        </Dialog>,
      );
      expect(screen.queryByText('Details')).toBeNull();
    });

    test('renders title, description, footer, and children when open', () => {
      render(
        <Dialog
          closeLabel="Close"
          open
          title="Details"
          description="More info"
          onClose={() => undefined}
          footer={<button>Done</button>}
        >
          Content
        </Dialog>,
      );
      expect(
        screen.getByRole('heading', { name: 'Details' }),
      ).toBeInTheDocument();
      expect(screen.getByText('More info')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    });

    test('portals into document.body as a modal dialog', () => {
      const { container } = render(
        <Dialog
          closeLabel="Close"
          open
          title="Details"
          onClose={() => undefined}
        >
          Content
        </Dialog>,
      );
      const dialog = screen.getByRole('dialog', { name: 'Details' });
      expect(container).not.toContainElement(dialog);
      expect(document.body).toContainElement(dialog);
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    test('puts data attributes on the portalled dialog, so a theme scope survives the portal', () => {
      render(
        <div data-theme="harbor">
          <Dialog
            closeLabel="Close"
            open
            title="Details"
            onClose={() => undefined}
            data-theme="harbor"
            data-testid="details-dialog"
          >
            Content
          </Dialog>
        </div>,
      );
      const dialog = screen.getByRole('dialog', { name: 'Details' });
      expect(dialog).toBe(screen.getByTestId('details-dialog'));
      expect(dialog).toHaveAttribute('data-theme', 'harbor');
      expect(dialog.closest('[data-theme]')).toBe(dialog);
    });

    test('lets only the top dialog answer Escape when one opens from another', () => {
      const onOuterClose = jest.fn();
      const Stacked = () => {
        const [innerOpen, setInnerOpen] = useState(false);
        return (
          <Dialog closeLabel="Close" open title="Outer" onClose={onOuterClose}>
            <button onClick={() => setInnerOpen(true)}>Open inner</button>
            <Dialog
              closeLabel="Close inner"
              open={innerOpen}
              title="Inner"
              onClose={() => setInnerOpen(false)}
            >
              Inner content
            </Dialog>
          </Dialog>
        );
      };
      render(<Stacked />);
      fireEvent.click(screen.getByRole('button', { name: 'Open inner' }));

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(screen.queryByRole('dialog', { name: 'Inner' })).toBeNull();
      expect(screen.getByRole('dialog', { name: 'Outer' })).toBeInTheDocument();
      expect(onOuterClose).not.toHaveBeenCalled();
    });

    test('takes the theme around its opener when it has none of its own', () => {
      render(
        <div data-theme="clay">
          <OpenerHarness mountOnOpen={false} />
        </div>,
      );
      const opener = screen.getByRole('button', { name: 'Open' });
      opener.focus();
      fireEvent.click(opener);

      expect(screen.getByRole('dialog', { name: 'Details' })).toHaveAttribute(
        'data-theme',
        'clay',
      );
    });

    test('keeps its own theme over the one around its opener', () => {
      const Themed = () => {
        const [open, setOpen] = useState(false);
        return (
          <div data-theme="clay">
            <button onClick={() => setOpen(true)}>Open</button>
            <Dialog
              closeLabel="Close"
              open={open}
              title="Details"
              onClose={() => setOpen(false)}
              data-theme="harbor"
            >
              Content
            </Dialog>
          </div>
        );
      };
      render(<Themed />);
      const opener = screen.getByRole('button', { name: 'Open' });
      opener.focus();
      fireEvent.click(opener);

      expect(screen.getByRole('dialog', { name: 'Details' })).toHaveAttribute(
        'data-theme',
        'harbor',
      );
    });

    test('takes the enclosing ThemeScope theme and mode without an opener', () => {
      render(
        <ThemeScope theme="harbor" mode="dark">
          <Dialog
            closeLabel="Close"
            open
            title="Details"
            onClose={() => undefined}
          >
            Content
          </Dialog>
        </ThemeScope>,
      );
      const dialog = screen.getByRole('dialog', { name: 'Details' });
      expect(dialog).toHaveAttribute('data-theme', 'harbor');
      expect(dialog).toHaveAttribute('data-mode', 'dark');
    });

    test('prefers the ThemeScope theme over the one around its opener', () => {
      render(
        <ThemeScope theme="harbor">
          <div data-theme="clay">
            <OpenerHarness mountOnOpen={false} />
          </div>
        </ThemeScope>,
      );
      const opener = screen.getByRole('button', { name: 'Open' });
      opener.focus();
      fireEvent.click(opener);

      expect(screen.getByRole('dialog', { name: 'Details' })).toHaveAttribute(
        'data-theme',
        'harbor',
      );
    });

    test('keeps its own theme over the ThemeScope one', () => {
      render(
        <ThemeScope theme="harbor" mode="dark">
          <Dialog
            closeLabel="Close"
            open
            title="Details"
            onClose={() => undefined}
            data-theme="clay"
            data-mode="light"
          >
            Content
          </Dialog>
        </ThemeScope>,
      );
      const dialog = screen.getByRole('dialog', { name: 'Details' });
      expect(dialog).toHaveAttribute('data-theme', 'clay');
      expect(dialog).toHaveAttribute('data-mode', 'light');
    });

    test('takes the opener theme when data-theme is passed as undefined', () => {
      const Wrapped = () => {
        const [open, setOpen] = useState(false);
        return (
          <div data-theme="clay">
            <button onClick={() => setOpen(true)}>Open</button>
            <Dialog
              closeLabel="Close"
              open={open}
              title="Details"
              onClose={() => setOpen(false)}
              data-theme={undefined}
            >
              Content
            </Dialog>
          </div>
        );
      };
      render(<Wrapped />);
      const opener = screen.getByRole('button', { name: 'Open' });
      opener.focus();
      fireEvent.click(opener);

      expect(screen.getByRole('dialog', { name: 'Details' })).toHaveAttribute(
        'data-theme',
        'clay',
      );
    });

    test('passes its own theme to a dialog opened from it', () => {
      const Stacked = () => {
        const [innerOpen, setInnerOpen] = useState(false);
        return (
          <ThemeScope theme="harbor">
            <Dialog
              closeLabel="Close"
              open
              title="Outer"
              onClose={() => undefined}
              data-theme="sage"
            >
              <button onClick={() => setInnerOpen(true)}>Open inner</button>
              <Dialog
                closeLabel="Close inner"
                open={innerOpen}
                title="Inner"
                onClose={() => setInnerOpen(false)}
              >
                Inner content
              </Dialog>
            </Dialog>
          </ThemeScope>
        );
      };
      render(<Stacked />);
      fireEvent.click(screen.getByRole('button', { name: 'Open inner' }));

      expect(screen.getByRole('dialog', { name: 'Inner' })).toHaveAttribute(
        'data-theme',
        'sage',
      );
    });

    test('calls onClose when the close control is pressed', () => {
      const onClose = jest.fn();
      render(
        <Dialog closeLabel="Close" open title="Details" onClose={onClose}>
          Content
        </Dialog>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('describes the dialog by its description', () => {
      render(
        <Dialog
          closeLabel="Close"
          open
          title="Details"
          description="More info"
          onClose={() => undefined}
        >
          Content
        </Dialog>,
      );
      expect(
        screen.getByRole('dialog', { name: 'Details' }),
      ).toHaveAccessibleDescription('More info');
    });

    test('leaves the dialog without a description when it has none', () => {
      render(
        <Dialog
          closeLabel="Close"
          open
          title="Details"
          onClose={() => undefined}
        >
          Content
        </Dialog>,
      );
      expect(
        screen.getByRole('dialog', { name: 'Details' }),
      ).not.toHaveAttribute('aria-describedby');
    });

    test('supports the alertdialog role, test ids and ref', () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <Dialog
          ref={ref}
          role="alertdialog"
          data-testid="confirm"
          closeLabel="Close"
          open
          title="Delete?"
          onClose={() => undefined}
        >
          Content
        </Dialog>,
      );
      const dialog = screen.getByRole('alertdialog', { name: 'Delete?' });
      expect(dialog).toHaveAttribute('data-testid', 'confirm');
      expect(ref.current).toBe(dialog);
    });
  });

  describe('scroll lock', () => {
    test('locks body scroll while open and restores it on close', () => {
      document.body.style.overflow = 'auto';
      const { rerender } = render(
        <Dialog
          closeLabel="Close"
          open
          title="Details"
          onClose={() => undefined}
        >
          Content
        </Dialog>,
      );
      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Dialog
          closeLabel="Close"
          open={false}
          title="Details"
          onClose={() => undefined}
        >
          Content
        </Dialog>,
      );
      expect(document.body.style.overflow).toBe('auto');
      document.body.style.overflow = '';
    });

    test('keeps the page locked until the last open dialog closes, in any order', () => {
      document.body.style.overflow = 'auto';
      const pair = (outer: boolean, inner: boolean) => (
        <>
          <Dialog
            closeLabel="Close"
            open={outer}
            title="Outer"
            onClose={() => undefined}
          >
            Outer
          </Dialog>
          <Dialog
            closeLabel="Close"
            open={inner}
            title="Inner"
            onClose={() => undefined}
          >
            Inner
          </Dialog>
        </>
      );
      const { rerender } = render(pair(true, true));
      expect(document.body.style.overflow).toBe('hidden');

      rerender(pair(false, true));
      expect(document.body.style.overflow).toBe('hidden');

      rerender(pair(false, false));
      expect(document.body.style.overflow).toBe('auto');
      document.body.style.overflow = '';
    });
  });

  describe('focus', () => {
    test('moves focus to the close control when it opens', () => {
      render(<OpenerHarness mountOnOpen={false} />);
      fireEvent.click(screen.getByRole('button', { name: 'Open' }));
      expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    });

    test('moves focus to initialFocusRef when given', () => {
      const Harness = () => {
        const nameRef = useRef<HTMLInputElement>(null);
        return (
          <Dialog
            closeLabel="Close"
            open
            title="Details"
            onClose={() => undefined}
            initialFocusRef={nameRef}
          >
            <input ref={nameRef} aria-label="Name" />
          </Dialog>
        );
      };
      render(<Harness />);
      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
    });

    test.each`
      mountOnOpen
      ${false}
      ${true}
    `(
      'returns focus to the opener on Escape when mountOnOpen is $mountOnOpen',
      ({ mountOnOpen }: { mountOnOpen: boolean }) => {
        render(<OpenerHarness mountOnOpen={mountOnOpen} />);
        const opener = screen.getByRole('button', { name: 'Open' });
        opener.focus();
        fireEvent.click(opener);

        fireEvent.keyDown(screen.getByRole('button', { name: 'Close' }), {
          key: 'Escape',
        });

        expect(screen.queryByRole('dialog')).toBeNull();
        expect(opener).toHaveFocus();
      },
    );

    test('returns focus to the opener when the close control is pressed', () => {
      render(<OpenerHarness mountOnOpen={false} />);
      const opener = screen.getByRole('button', { name: 'Open' });
      opener.focus();
      fireEvent.click(opener);

      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(opener).toHaveFocus();
    });

    test('keeps focus on a field when the parent re-renders with a new onClose', () => {
      const { rerender } = render(<FieldsDialog onClose={() => undefined} />);
      const field = screen.getByRole('textbox', { name: 'Name' });
      field.focus();

      rerender(<FieldsDialog onClose={() => undefined} />);

      expect(field).toHaveFocus();
    });
  });

  describe('keyboard', () => {
    test('calls onClose when Escape is pressed', () => {
      const onClose = jest.fn();
      render(<FieldsDialog onClose={onClose} />);
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'Name' }), {
        key: 'Escape',
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('ignores an Escape a control inside the dialog already handled', () => {
      const onClose = jest.fn();
      render(
        <Dialog closeLabel="Close" open title="Details" onClose={onClose}>
          <input
            aria-label="Search"
            onKeyDown={(event) =>
              event.key === 'Escape' && event.preventDefault()
            }
          />
        </Dialog>,
      );
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search' }), {
        key: 'Escape',
      });
      expect(onClose).not.toHaveBeenCalled();
    });

    test.each`
      from       | shiftKey | to
      ${'Save'}  | ${false} | ${'Close'}
      ${'Close'} | ${true}  | ${'Save'}
    `(
      'moves focus from $from to $to on Tab with shift $shiftKey',
      ({
        from,
        shiftKey,
        to,
      }: {
        from: string;
        shiftKey: boolean;
        to: string;
      }) => {
        render(<FieldsDialog onClose={() => undefined} />);
        const start = screen.getByRole('button', { name: from });
        start.focus();

        fireEvent.keyDown(start, { key: 'Tab', shiftKey });

        expect(screen.getByRole('button', { name: to })).toHaveFocus();
      },
    );

    test.each`
      shiftKey | to
      ${false} | ${'Close'}
      ${true}  | ${'Save'}
    `(
      'moves focus from the page body to $to on Tab with shift $shiftKey',
      ({ shiftKey, to }: { shiftKey: boolean; to: string }) => {
        render(<FieldsDialog onClose={() => undefined} />);
        screen.getByRole('button', { name: 'Close' }).blur();

        fireEvent.keyDown(document.body, { key: 'Tab', shiftKey });

        expect(screen.getByRole('button', { name: to })).toHaveFocus();
      },
    );

    test('leaves Tab to the browser between the first and last controls', () => {
      render(<FieldsDialog onClose={() => undefined} />);
      const field = screen.getByRole('textbox', { name: 'Name' });
      field.focus();

      const notPrevented = fireEvent.keyDown(field, { key: 'Tab' });

      expect(notPrevented).toBe(true);
      expect(field).toHaveFocus();
    });

    test('holds Tab on the close control when the dialog has no other control', () => {
      render(
        <Dialog
          closeLabel="Close"
          open
          title="Details"
          onClose={() => undefined}
        >
          Read-only content
        </Dialog>,
      );
      const close = screen.getByRole('button', { name: 'Close' });

      const notPrevented = fireEvent.keyDown(close, { key: 'Tab' });

      expect(notPrevented).toBe(false);
      expect(close).toHaveFocus();
    });

    test('wraps Tab from the last control past a trailing disabled button', () => {
      render(
        <Dialog
          closeLabel="Close"
          open
          title="Details"
          onClose={() => undefined}
        >
          <input aria-label="Reason" />
          <button disabled>Submit</button>
        </Dialog>,
      );
      const reason = screen.getByRole('textbox', { name: 'Reason' });
      reason.focus();

      fireEvent.keyDown(reason, { key: 'Tab' });

      expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    });

    test('wraps Tab from the last control past a trailing tabindex -1 field', () => {
      render(
        <Dialog
          closeLabel="Close"
          open
          title="Details"
          onClose={() => undefined}
        >
          <input aria-label="Reason" />
          <input aria-label="Honeypot" tabIndex={-1} />
        </Dialog>,
      );
      const reason = screen.getByRole('textbox', { name: 'Reason' });
      reason.focus();

      fireEvent.keyDown(reason, { key: 'Tab' });

      expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    });

    test('stops answering Escape once closed', () => {
      const onClose = jest.fn();
      const { rerender } = render(
        <Dialog closeLabel="Close" open title="Details" onClose={onClose}>
          Content
        </Dialog>,
      );
      rerender(
        <Dialog
          closeLabel="Close"
          open={false}
          title="Details"
          onClose={onClose}
        >
          Content
        </Dialog>,
      );

      fireEvent.keyDown(document.body, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
