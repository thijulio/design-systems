import { createRef } from 'react';
import { createPortal } from 'react-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ThemeScope } from '../ThemeScope/ThemeScope';
import { ToastViewport } from './ToastViewport';
import styles from './ToastViewport.module.css';

describe('ToastViewport', () => {
  it('is a named, polite status region even when empty', () => {
    render(<ToastViewport label="Notifications" />);
    const region = screen.getByRole('status', { name: 'Notifications' });
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveClass(styles.viewport);
    expect(region).toBeEmptyDOMElement();
  });

  it('renders its toasts in order', () => {
    render(
      <ToastViewport label="Notifications">
        <div>First</div>
        <div>Second</div>
      </ToastViewport>,
    );
    const region = screen.getByRole('status');
    expect(region).toHaveTextContent(/^FirstSecond$/);
  });

  it('lets an explicit role and DOM props through', () => {
    render(
      <ToastViewport
        label="Errors"
        role="region"
        data-testid="viewport"
        className="extra"
      />,
    );
    const region = screen.getByTestId('viewport');
    expect(region).toHaveAttribute('role', 'region');
    expect(region).toHaveAccessibleName('Errors');
    expect(region).toHaveClass(styles.viewport, 'extra');
  });

  it('carries the ThemeScope theme when portalled out of it', () => {
    render(
      <ThemeScope theme="harbor" mode="dark" data-testid="scope">
        {createPortal(
          <ToastViewport label="Notifications" />,
          document.body,
        )}
      </ThemeScope>,
    );
    const region = screen.getByRole('status', { name: 'Notifications' });
    expect(screen.getByTestId('scope')).not.toContainElement(region);
    expect(region).toHaveAttribute('data-theme', 'harbor');
    expect(region).toHaveAttribute('data-mode', 'dark');
  });

  it('keeps its own theme over the ThemeScope one', () => {
    render(
      <ThemeScope theme="harbor">
        <ToastViewport label="Notifications" data-theme="clay" />
      </ThemeScope>,
    );
    expect(screen.getByRole('status')).toHaveAttribute('data-theme', 'clay');
  });

  it('adds no theme outside a ThemeScope', () => {
    render(<ToastViewport label="Notifications" />);
    expect(screen.getByRole('status')).not.toHaveAttribute('data-theme');
  });

  it('pauses while a toast is hovered', () => {
    const onPause = jest.fn();
    const onResume = jest.fn();
    render(
      <ToastViewport label="Notifications" {...{ onPause, onResume }}>
        <div>Saved</div>
      </ToastViewport>,
    );
    const toast = screen.getByText('Saved');

    fireEvent.pointerEnter(toast);
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(onResume).not.toHaveBeenCalled();

    fireEvent.pointerLeave(toast);
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it('pauses while focus is inside, across moves between toasts', () => {
    const onPause = jest.fn();
    const onResume = jest.fn();
    render(
      <>
        <ToastViewport label="Notifications" {...{ onPause, onResume }}>
          <button type="button">First</button>
          <button type="button">Second</button>
        </ToastViewport>
        <button type="button">Outside</button>
      </>,
    );

    act(() => screen.getByRole('button', { name: 'First' }).focus());
    act(() => screen.getByRole('button', { name: 'Second' }).focus());
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(onResume).not.toHaveBeenCalled();

    act(() => screen.getByRole('button', { name: 'Outside' }).focus());
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it('stays paused while hovered or focused, until both leave', () => {
    const onPause = jest.fn();
    const onResume = jest.fn();
    render(
      <ToastViewport label="Notifications" {...{ onPause, onResume }}>
        <button type="button">Dismiss</button>
      </ToastViewport>,
    );
    const button = screen.getByRole('button', { name: 'Dismiss' });

    fireEvent.pointerEnter(button);
    act(() => button.focus());
    fireEvent.pointerLeave(button);
    expect(onResume).not.toHaveBeenCalled();

    act(() => button.blur());
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it('resumes when the focused toast is removed', () => {
    const onPause = jest.fn();
    const onResume = jest.fn();
    const { rerender } = render(
      <ToastViewport label="Notifications" {...{ onPause, onResume }}>
        <button type="button">Dismiss</button>
      </ToastViewport>,
    );
    act(() => screen.getByRole('button', { name: 'Dismiss' }).focus());
    expect(onPause).toHaveBeenCalledTimes(1);

    rerender(
      <ToastViewport label="Notifications" {...{ onPause, onResume }} />,
    );
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it('still calls the caller pointer and focus handlers', () => {
    const onPointerEnter = jest.fn();
    const onFocus = jest.fn();
    render(
      <ToastViewport label="Notifications" {...{ onPointerEnter, onFocus }}>
        <button type="button">Dismiss</button>
      </ToastViewport>,
    );
    const button = screen.getByRole('button', { name: 'Dismiss' });
    fireEvent.pointerEnter(button);
    act(() => button.focus());
    expect(onPointerEnter).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ToastViewport ref={ref} label="Notifications" />);
    expect(ref.current).toBe(screen.getByRole('status'));
  });
});
