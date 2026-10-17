import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { LoadMore } from './LoadMore';

describe('LoadMore', () => {
  it('renders the shared status and a working, skinned button', () => {
    const onLoadMore = jest.fn();
    render(
      <LoadMore
        shown={12}
        total={30}
        status={(shown, total) => `Showing ${shown} of ${total}`}
        label="Load more"
        onLoadMore={onLoadMore}
        hasMore
        buttonTestId="more"
        buttonClassName="extra"
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Showing 12 of 30');
    const button = screen.getByRole('button', { name: 'Load more' });
    expect(button).toBe(screen.getByTestId('more'));
    expect(button).toHaveClass('extra');
    fireEvent.click(button);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('forwards a ref and DOM props to its root', () => {
    const ref = createRef<HTMLElement>();
    render(
      <LoadMore
        ref={ref}
        data-testid="root"
        shown={1}
        total={1}
        status={(shown, total) => `${shown} of ${total}`}
        label="Load more"
        onLoadMore={jest.fn()}
        hasMore={false}
      />,
    );
    expect(ref.current).toBe(screen.getByTestId('root'));
  });
});
