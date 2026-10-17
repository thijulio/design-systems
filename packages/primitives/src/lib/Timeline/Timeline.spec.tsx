import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Timeline, TimelineItem } from './Timeline';
import styles from './Timeline.module.css';

describe('Timeline', () => {
  it('renders an ol with role="list", dots and a gap of 3 by default', () => {
    render(
      <Timeline>
        <TimelineItem title="Created" />
        <li>Sent</li>
      </Timeline>,
    );
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(list).toHaveAttribute('role', 'list');
    expect(list).toHaveClass(styles.timeline, styles.dots, styles.g3);
    expect(list).not.toHaveClass(styles.rail);
    expect(list.querySelectorAll(':scope > li')).toHaveLength(2);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('honours marker, rail and gap', () => {
    render(<Timeline marker="none" rail gap={0} reversed />);
    const list = screen.getByRole('list');
    expect(list).toHaveClass(styles.rail, styles.g0);
    expect(list).not.toHaveClass(styles.dots);
    expect(list).toHaveAttribute('reversed');
  });

  it('forwards ref, className and DOM props', () => {
    const ref = createRef<HTMLOListElement>();
    render(<Timeline ref={ref} className="extra" data-testid="timeline" />);
    const list = screen.getByTestId('timeline');
    expect(ref.current).toBe(list);
    expect(list).toHaveClass('extra', styles.timeline);
  });
});

describe('TimelineItem', () => {
  it('puts the title, then the time in a <time>, then the body', () => {
    render(
      <ol>
        <TimelineItem
          data-testid="item"
          title="Shipped"
          time="1 March"
          dateTime="2026-03-01"
        >
          Left the warehouse
        </TimelineItem>
      </ol>,
    );
    const item = screen.getByTestId('item');
    expect(item.tagName).toBe('LI');
    expect(item).toHaveClass(styles.item, styles.toneAccent);
    const [header, body] = Array.from(item.children);
    expect(header).toHaveClass(styles.header);
    expect(header.firstElementChild).toHaveTextContent('Shipped');
    const time = item.querySelector('time');
    expect(time).toHaveAttribute('dateTime', '2026-03-01');
    expect(time).toHaveTextContent('1 March');
    expect(body).toHaveClass(styles.body);
    expect(body).toHaveTextContent('Left the warehouse');
    // A space keeps the title and the time apart as text.
    expect(item.textContent).toBe('Shipped 1 MarchLeft the warehouse');
  });

  it('shows a time with no machine value in a span', () => {
    render(
      <ol>
        <TimelineItem data-testid="item" title="Delivery" time="Unknown" />
      </ol>,
    );
    const item = screen.getByTestId('item');
    expect(item.querySelector('time')).toBeNull();
    expect(screen.getByText('Unknown').tagName).toBe('SPAN');
  });

  it('renders bare children without a header and takes a tone', () => {
    const ref = createRef<HTMLLIElement>();
    render(
      <ol>
        <TimelineItem ref={ref} tone="danger" data-testid="item">
          <h3>Cancelled</h3>
        </TimelineItem>
      </ol>,
    );
    const item = screen.getByTestId('item');
    expect(ref.current).toBe(item);
    expect(item).toHaveClass(styles.toneDanger);
    expect(item.firstElementChild?.tagName).toBe('H3');
    expect(item.querySelector(`.${styles.header}`)).toBeNull();
  });
});
