import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  Table,
  type TableColumn,
  type TableSortState,
} from '@thijulio/primitives';

interface Invoice {
  id: string;
  customer: string;
  email: string;
  issued: string;
  due: string;
  amount: string;
  status: string;
}

const INVOICES: Invoice[] = [
  {
    id: 'INV-1042',
    customer: 'Northwind Traders',
    email: 'billing@northwind.example',
    issued: '2 Sep 2026',
    due: '2 Oct 2026',
    amount: '€1,250.00',
    status: 'Paid',
  },
  {
    id: 'INV-1043',
    customer: 'Blue Harbor Studio',
    email: 'accounts@blueharbor.example',
    issued: '9 Sep 2026',
    due: '9 Oct 2026',
    amount: '€480.00',
    status: 'Overdue',
  },
  {
    id: 'INV-1044',
    customer: 'Juniper & Co.',
    email: 'finance@juniper.example',
    issued: '16 Sep 2026',
    due: '16 Oct 2026',
    amount: '€2,075.50',
    status: 'Pending',
  },
];

const COLUMNS: TableColumn<Invoice>[] = [
  { key: 'id', header: 'Invoice', cell: (row) => row.id },
  { key: 'customer', header: 'Customer', cell: (row) => row.customer },
  { key: 'issued', header: 'Issued', cell: (row) => row.issued },
  { key: 'amount', header: 'Amount', cell: (row) => row.amount, align: 'end' },
  { key: 'status', header: 'Status', cell: (row) => row.status },
];

// More, fixed-width columns than a narrow box can hold.
const WIDE_COLUMNS: TableColumn<Invoice>[] = [
  { key: 'id', header: 'Invoice', cell: (row) => row.id, width: '8rem' },
  {
    key: 'customer',
    header: 'Customer',
    cell: (row) => row.customer,
    width: '12rem',
  },
  {
    key: 'email',
    header: 'Billing email',
    cell: (row) => row.email,
    width: '16rem',
  },
  { key: 'issued', header: 'Issued', cell: (row) => row.issued, width: '8rem' },
  { key: 'due', header: 'Due', cell: (row) => row.due, width: '8rem' },
  {
    key: 'amount',
    header: 'Amount',
    cell: (row) => row.amount,
    align: 'end',
    width: '8rem',
  },
];

// The caller owns the sort and orders the rows; the table only reports
// presses and exposes the state through aria-sort.
function SortableDemo() {
  const [sortState, setSortState] = useState<TableSortState | null>(null);
  const rows = useMemo(() => {
    if (!sortState) return INVOICES;
    const factor = sortState.direction === 'ascending' ? 1 : -1;
    const amount = (row: Invoice) => Number(row.amount.replace(/[^0-9.]/g, ''));
    return [...INVOICES].sort(
      (a, b) =>
        factor *
        (sortState.key === 'amount'
          ? amount(a) - amount(b)
          : a.customer.localeCompare(b.customer)),
    );
  }, [sortState]);
  return (
    <Table<Invoice>
      columns={[
        { key: 'id', header: 'Invoice', cell: (row) => row.id },
        {
          key: 'customer',
          header: 'Customer',
          cell: (row) => row.customer,
          sort: {},
        },
        {
          key: 'amount',
          header: 'Amount',
          cell: (row) => row.amount,
          align: 'end',
          sort: { directions: ['descending'] },
        },
        { key: 'status', header: 'Status', cell: (row) => row.status },
      ]}
      rows={rows}
      getRowKey={(row) => row.id}
      caption="Recent invoices"
      emptyLabel="No invoices yet."
      sortState={sortState}
      onSortChange={setSortState}
      sortLabels={{
        ascending: 'Sort ascending',
        descending: 'Sort descending',
        none: 'Remove sort',
      }}
    />
  );
}

const meta: Meta<typeof Table<Invoice>> = {
  title: 'Components/Table',
  component: Table,
  args: {
    columns: COLUMNS,
    rows: INVOICES,
    getRowKey: (row) => row.id,
    caption: 'Recent invoices',
    emptyLabel: 'No invoices yet.',
  },
  argTypes: {
    columns: {
      control: false,
      description: 'Column definitions: key, header, cell, align, width.',
    },
    rows: { control: false, description: 'Row data, one object per row.' },
    getRowKey: { control: false, description: 'Stable React key per row.' },
    caption: {
      description:
        'Names the table, and the scroll region when the table overflows.',
    },
    captionHidden: {
      description: 'Keep the caption for assistive technology only.',
    },
    emptyLabel: {
      description: 'Shown instead of the table with no rows (no default copy).',
    },
    stickyHeader: {
      description: 'Stick the header row to the top of the scroll container.',
    },
    density: {
      control: 'inline-radio',
      options: ['normal', 'compact'],
      description: 'Cell padding.',
    },
    sortState: {
      control: false,
      description:
        'Controlled sort: `{ key, direction }` or null. The caller sorts ' +
        'the rows. Columns opt in with `sort`; their header becomes a ' +
        'button and the `th` gets `aria-sort`.',
    },
    onSortChange: {
      control: false,
      description: 'Called with the next sort state when a header is pressed.',
    },
    sortLabels: {
      control: false,
      description:
        'Descriptions of what the next press does (ascending, descending, ' +
        'none). Required with sorting: no default copy.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Table<Invoice>>;

// The caption names the table; headers are column headers (scope="col").
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const table = within(canvasElement).getByRole('table', {
      name: 'Recent invoices',
    });
    await expect(within(table).getAllByRole('columnheader')).toHaveLength(5);
    // One header row plus three body rows.
    await expect(within(table).getAllByRole('row')).toHaveLength(4);
    await expect(
      within(table).getByRole('cell', { name: '€480.00' }),
    ).toBeVisible();
  },
};

export const Compact: Story = { args: { density: 'compact' } };

// The caption is hidden visually but still names the table.
export const CaptionHidden: Story = {
  args: { captionHidden: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('table', { name: 'Recent invoices' }),
    ).toBeInTheDocument();
  },
};

// No rows: no table at all, only the empty label.
export const Empty: Story = {
  args: { rows: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('table')).toBeNull();
    await expect(canvas.getByText('No invoices yet.')).toBeVisible();
  },
};

// In a narrow box the root scrolls sideways. It then becomes a focusable
// region named by the caption, so keyboard users can reach and scroll it.
export const Overflowing: Story = {
  args: { columns: WIDE_COLUMNS, density: 'compact' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = await waitFor(() =>
      canvas.getByRole('region', { name: 'Recent invoices' }),
    );
    await expect(region).toHaveAttribute('tabindex', '0');
    await userEvent.tab();
    await expect(region).toHaveFocus();
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
  },
};

// A `rowHeader` column labels each row (`th scope="row"`); without a header
// its top cell is an empty corner.
export const RowHeaders: Story = {
  args: {
    caption: 'Invoice dates',
    columns: [
      { key: 'id', cell: (row) => row.id, rowHeader: true },
      { key: 'issued', header: 'Issued', cell: (row) => row.issued },
      { key: 'due', header: 'Due', cell: (row) => row.due },
    ],
  },
  play: async ({ canvasElement }) => {
    const table = within(canvasElement).getByRole('table', {
      name: 'Invoice dates',
    });
    const rowHeaders = within(table).getAllByRole('rowheader');
    await expect(rowHeaders).toHaveLength(3);
    await expect(rowHeaders[0]).toHaveTextContent('INV-1042');
    await expect(within(table).getAllByRole('columnheader')).toHaveLength(2);
  },
};

// Customer cycles ascending, descending, unsorted; Amount only sorts
// descending, then clears. Each button describes what its next press does.
export const Sortable: Story = {
  render: () => <SortableDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const customer = canvas.getByRole('button', { name: 'Customer' });
    const header = customer.closest('th');
    await expect(header).toHaveAttribute('aria-sort', 'none');
    await expect(customer).toHaveAccessibleDescription('Sort ascending');

    await userEvent.tab();
    await expect(customer).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await expect(customer).toHaveAccessibleDescription('Sort descending');
    await expect(canvas.getAllByRole('row')[1]).toHaveTextContent(
      'Blue Harbor Studio',
    );

    await userEvent.keyboard(' ');
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await expect(customer).toHaveAccessibleDescription('Remove sort');

    const amount = canvas.getByRole('button', { name: 'Amount' });
    await userEvent.click(amount);
    await expect(header).toHaveAttribute('aria-sort', 'none');
    await expect(amount.closest('th')).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    await expect(amount).toHaveAccessibleDescription('Remove sort');
  },
};
