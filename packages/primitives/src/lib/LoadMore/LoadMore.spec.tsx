import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { LoadMore, type LoadMoreProps } from './LoadMore';
import hiddenStyles from '../VisuallyHidden/VisuallyHidden.module.css';
import styles from './LoadMore.module.css';

const status = (shown: number, total: number) => `Showing ${shown} of ${total}`;

function renderLoadMore(props: Partial<LoadMoreProps> = {}) {
  const onLoadMore = jest.fn();
  const view = render(
    <LoadMore
      shown={12}
      total={30}
      status={status}
      label="Load more"
      onLoadMore={onLoadMore}
      hasMore
      statusTestId="status"
      buttonTestId="more"
      {...props}
    />,
  );
  return { ...view, onLoadMore };
}

describe('LoadMore', () => {
  it('announces "x of y" in a hidden polite region', () => {
    renderLoadMore();
    const region = screen.getByRole('status');
    expect(region).toBe(screen.getByTestId('status'));
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveClass(hiddenStyles.hidden);
    expect(region.tagName).toBe('P');
    expect(region).toHaveTextContent('Showing 12 of 30');
  });

  it('puts the status before the button', () => {
    renderLoadMore();
    const region = screen.getByTestId('status');
    const button = screen.getByTestId('more');
    expect(
      region.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('asks for the next page on press', () => {
    const { onLoadMore } = renderLoadMore();
    const button = screen.getByRole('button', { name: 'Load more' });
    expect(button).toHaveAttribute('type', 'button');
    fireEvent.click(button);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('keeps the button focused and busy while a page is in flight', () => {
    const { rerender, onLoadMore } = renderLoadMore({ loading: false });
    const button = screen.getByTestId('more');
    expect(button).toHaveAttribute('aria-busy', 'false');
    button.focus();

    rerender(
      <LoadMore
        shown={12}
        total={30}
        status={status}
        label="Load more"
        onLoadMore={onLoadMore}
        hasMore={false}
        loading
        buttonTestId="more"
      />,
    );
    expect(screen.getByTestId('more')).toBe(button);
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    expect(button).toHaveFocus();
    fireEvent.click(button);
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('keeps the button after a failed page, unavailable', () => {
    const { onLoadMore } = renderLoadMore({ hasMore: false, failed: true });
    const button = screen.getByTestId('more');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('drops the button at the end but keeps the same status node', () => {
    const { rerender } = renderLoadMore();
    const region = screen.getByTestId('status');
    expect(screen.getByTestId('more').parentElement).not.toHaveClass(
      styles.idle,
    );

    rerender(
      <LoadMore
        shown={30}
        total={30}
        status={status}
        label="Load more"
        onLoadMore={jest.fn()}
        hasMore={false}
        statusTestId="status"
      />,
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByTestId('status')).toBe(region);
    expect(region).toHaveTextContent('Showing 30 of 30');
    expect(region.parentElement).toHaveClass(styles.idle);
  });

  it('leaves aria-busy and aria-disabled off when unset', () => {
    renderLoadMore();
    const button = screen.getByTestId('more');
    expect(button).not.toHaveAttribute('aria-busy');
    expect(button).not.toHaveAttribute('aria-disabled');
  });

  it('aligns the button and takes extra button classes', () => {
    renderLoadMore({ align: 'end', buttonClassName: 'skin' });
    const button = screen.getByTestId('more');
    expect(button).toHaveClass('skin');
    expect(button.parentElement).toHaveClass(styles.root, styles.end);
  });

  it('forwards a ref and DOM props to its root', () => {
    const ref = createRef<HTMLElement>();
    render(
      <LoadMore
        ref={ref}
        className="extra"
        data-testid="root"
        shown={1}
        total={2}
        status={status}
        label="Load more"
        onLoadMore={jest.fn()}
        hasMore
      />,
    );
    expect(ref.current).toBe(screen.getByTestId('root'));
    expect(ref.current).toHaveClass('extra');
  });
});
