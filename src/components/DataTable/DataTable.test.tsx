import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { DataTable } from './DataTable';
import type { ColumnDef, Row } from '../../types/dataset';

const columns: ColumnDef[] = [
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'score', label: 'Score', type: 'number' },
];

const rows: Row[] = [
  { name: 'Grace', score: 20 },
  { name: 'Ada', score: 30 },
  { name: 'Alan', score: 10 },
];

describe('DataTable', () => {
  it('renders column headers and all rows', () => {
    render(<DataTable columns={columns} rows={rows} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4); // header + 3 rows
  });

  it('sorts rows ascending when a column header is clicked', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} />);
    fireEvent.click(screen.getByText('Score'));

    const dataRows = container.querySelectorAll('tbody tr');
    expect(dataRows[0]).toHaveTextContent('Alan');
    expect(dataRows[1]).toHaveTextContent('Grace');
    expect(dataRows[2]).toHaveTextContent('Ada');
  });

  it('filters rows via the search box', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} />);
    const searchbar = container.querySelector('ion-searchbar')!;
    fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'grace' } }));

    const dataRows = container.querySelectorAll('tbody tr');
    expect(dataRows).toHaveLength(1);
    expect(dataRows[0]).toHaveTextContent('Grace');
  });

  it('shows an empty state when no rows match the filter', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} />);
    const searchbar = container.querySelector('ion-searchbar')!;
    fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'nonexistent' } }));

    expect(screen.getByText('No rows match your filter.')).toBeInTheDocument();
  });
});
