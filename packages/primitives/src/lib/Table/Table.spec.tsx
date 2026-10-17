import { createRef } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  Table,
  type TableColumn,
  type TableSortLabels,
  type TableSortState,
} from './Table';
import styles from './Table.module.css';

interface Row {
  id: string;
  name: string;
  amount: number;
}

const columns: TableColumn<Row>[] = [
  { key: 'name', header: 'Name', cell: (row) => row.name },
  {
    key: 'amount',
    header: 'Amount',
    cell: (row) => `${row.amount} EUR`,
    align: 'end',
    width: '8rem',
    cellClassName: 'amount-cell',
  },
];

const rows: Row[] = [
  { id: '1', name: 'Alice', amount: 10 },
  { id: '2', name: 'Bob', amount: 20 },
];

function mockOverflow(scrollWidth: number, clientWidth: number) {
  const scroll = jest
    .spyOn(Element.prototype, 'scrollWidth', 'get')
    .mockReturnValue(scrollWidth);
  const client = jest
    .spyOn(Element.prototype, 'clientWidth', 'get')
    .mockReturnValue(clientWidth);
  return () => {
    scroll.mockRestore();
    client.mockRestore();
  };
}

describe('Table', () => {
  it('renders the empty label instead of a table when there are no rows', () => {
    render(
      <Table<Row>
        columns={columns}
        rows={[]}
        getRowKey={(row) => row.id}
        emptyLabel="No users"
      />,
    );
    expect(screen.getByText('No users')).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('renders column headers with scope=col and one row per item', () => {
    render(
      <Table<Row>
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        emptyLabel="No users"
      />,
    );
    const headers = screen.getAllByRole('columnheader');
    expect(headers.map((th) => th.textContent)).toEqual(['Name', 'Amount']);
    headers.forEach((th) => expect(th).toHaveAttribute('scope', 'col'));
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('10 EUR')).toHaveClass(
      styles.alignEnd,
      'amount-cell',
    );
    expect(headers[1].style.getPropertyValue('--ds-table-column-width')).toBe(
      '8rem',
    );
  });

  it('renders a caption, optionally visually hidden', () => {
    render(
      <Table<Row>
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        emptyLabel="No users"
        caption="Payments"
        captionHidden
      />,
    );
    const table = screen.getByRole('table', { name: 'Payments' });
    expect(within(table).getByText('Payments')).toHaveClass(
      styles.visuallyHidden,
    );
  });

  it('is not a focusable region while it fits', () => {
    const { container } = render(
      <Table<Row>
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        emptyLabel="No users"
        caption="Payments"
      />,
    );
    expect(screen.queryByRole('region')).toBeNull();
    expect(container.firstElementChild).not.toHaveAttribute('tabindex');
  });

  it('becomes a focusable region named by the caption when it overflows', () => {
    const restore = mockOverflow(800, 300);
    try {
      render(
        <Table<Row>
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          emptyLabel="No users"
          caption="Payments"
        />,
      );
      const region = screen.getByRole('region', { name: 'Payments' });
      expect(region).toHaveAttribute('tabindex', '0');
    } finally {
      restore();
    }
  });

  it('stays keyboard-scrollable when it overflows without a name', () => {
    const restore = mockOverflow(800, 300);
    try {
      const { container } = render(
        <Table<Row>
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          emptyLabel="No users"
        />,
      );
      expect(screen.queryByRole('region')).toBeNull();
      expect(container.firstElementChild).toHaveAttribute('tabindex', '0');
    } finally {
      restore();
    }
  });

  it('names the table, not the plain scroll box, while it fits', () => {
    const { container } = render(
      <Table<Row>
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        emptyLabel="No users"
        aria-label="Payments"
      />,
    );
    expect(container.firstElementChild).not.toHaveAttribute('aria-label');
    expect(screen.getByRole('table', { name: 'Payments' })).toBeInTheDocument();
  });

  it('applies density and sticky header classes', () => {
    render(
      <Table<Row>
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        emptyLabel="No users"
        density="compact"
        stickyHeader
      />,
    );
    expect(screen.getByRole('table')).toHaveClass(
      styles.compact,
      styles.sticky,
    );
  });

  it('renders a rowHeader column as row headers, under an empty corner', () => {
    const { container } = render(
      <Table<Row>
        columns={[
          { key: 'name', cell: (row) => row.name, rowHeader: true },
          { key: 'amount', header: 'Amount', cell: (row) => row.amount },
        ]}
        rows={rows}
        getRowKey={(row) => row.id}
        emptyLabel="No users"
      />,
    );
    const rowHeaders = screen.getAllByRole('rowheader');
    expect(rowHeaders.map((th) => th.textContent)).toEqual(['Alice', 'Bob']);
    rowHeaders.forEach((th) => expect(th).toHaveAttribute('scope', 'row'));
    expect(rowHeaders[0]).toHaveClass(styles.td, styles.rowHeader);
    expect(
      container.querySelector('thead tr')?.firstElementChild?.tagName,
    ).toBe('TD');
    expect(screen.getAllByRole('columnheader')).toHaveLength(1);
  });

  describe('sorting', () => {
    const labels: TableSortLabels = {
      ascending: 'Sort ascending',
      descending: 'Sort descending',
      none: 'Remove sort',
    };
    const sortColumns: TableColumn<Row>[] = [
      { key: 'name', header: 'Name', cell: (row) => row.name, sort: {} },
      {
        key: 'amount',
        header: 'Amount',
        cell: (row) => row.amount,
        sort: { directions: ['descending'] },
      },
      { key: 'id', header: 'Id', cell: (row) => row.id },
    ];
    const renderSorted = (
      sortState: TableSortState | null,
      onSortChange = jest.fn(),
    ) => {
      render(
        <Table<Row>
          columns={sortColumns}
          rows={rows}
          getRowKey={(row) => row.id}
          emptyLabel="No users"
          sortState={sortState}
          onSortChange={onSortChange}
          sortLabels={labels}
        />,
      );
      return onSortChange;
    };

    it('puts a button in each sortable header and aria-sort on the th', () => {
      renderSorted({ key: 'name', direction: 'ascending' });
      const [name, amount, id] = screen.getAllByRole('columnheader');
      expect(name).toHaveAttribute('aria-sort', 'ascending');
      expect(amount).toHaveAttribute('aria-sort', 'none');
      expect(id).not.toHaveAttribute('aria-sort');
      expect(within(id).queryByRole('button')).toBeNull();
      expect(
        within(name).getByRole('button', { name: 'Name' }),
      ).toHaveAttribute('type', 'button');
    });

    it('describes and reports the next state of each press', () => {
      const onSortChange = renderSorted({
        key: 'name',
        direction: 'ascending',
      });
      const name = screen.getByRole('button', { name: 'Name' });
      const amount = screen.getByRole('button', { name: 'Amount' });
      expect(name).toHaveAccessibleDescription('Sort descending');
      expect(amount).toHaveAccessibleDescription('Sort descending');
      fireEvent.click(name);
      expect(onSortChange).toHaveBeenLastCalledWith({
        key: 'name',
        direction: 'descending',
      });
      fireEvent.click(amount);
      expect(onSortChange).toHaveBeenLastCalledWith({
        key: 'amount',
        direction: 'descending',
      });
    });

    it('returns to unsorted after the last direction', () => {
      const onSortChange = renderSorted({
        key: 'amount',
        direction: 'descending',
      });
      const amount = screen.getByRole('button', { name: 'Amount' });
      expect(amount.closest('th')).toHaveAttribute('aria-sort', 'descending');
      expect(amount).toHaveAccessibleDescription('Remove sort');
      fireEvent.click(amount);
      expect(onSortChange).toHaveBeenLastCalledWith(null);
      expect(
        screen.getByRole('button', { name: 'Name' }),
      ).toHaveAccessibleDescription('Sort ascending');
    });

    it('keeps headers plain without the sort props', () => {
      render(
        <Table<Row>
          columns={sortColumns}
          rows={rows}
          getRowKey={(row) => row.id}
          emptyLabel="No users"
        />,
      );
      expect(screen.queryByRole('button')).toBeNull();
      screen
        .getAllByRole('columnheader')
        .forEach((th) => expect(th).not.toHaveAttribute('aria-sort'));
    });
  });

  it('forwards ref and DOM props to the root', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Table<Row>
        ref={ref}
        data-testid="payments"
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        emptyLabel="No users"
      />,
    );
    expect(ref.current).toBe(screen.getByTestId('payments'));
  });
});
