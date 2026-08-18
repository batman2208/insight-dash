import { IonIcon, IonSearchbar } from '@ionic/react';
import { caretDown, caretUp, swapVertical } from 'ionicons/icons';
import { useFilter } from '../../hooks/useFilter';
import { useSort } from '../../hooks/useSort';
import type { ColumnDef, Row } from '../../types/dataset';
import './DataTable.css';

export interface DataTableProps {
  columns: ColumnDef[];
  rows: Row[];
}

export function DataTable({ columns, rows }: DataTableProps) {
  const { filteredRows, filterText, setFilterText } = useFilter(rows);
  const { sortedRows, sortColumn, sortDirection, toggleSort } = useSort(filteredRows);

  const sortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return swapVertical;
    return sortDirection === 'asc' ? caretUp : caretDown;
  };

  return (
    <div className="data-table-container">
      <IonSearchbar
        value={filterText}
        onIonInput={(e) => setFilterText(e.detail.value ?? '')}
        placeholder="Filter rows"
        className="data-table-search"
      />
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => toggleSort(column.key)}
                  className={column.type === 'number' ? 'is-numeric' : undefined}
                >
                  <span className="data-table-th-label">
                    {column.label}
                    <IonIcon
                      icon={sortIcon(column.key)}
                      className={sortColumn === column.key ? 'sort-icon is-active' : 'sort-icon'}
                    />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key} className={column.type === 'number' ? 'is-numeric' : undefined}>
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedRows.length === 0 && <p className="data-table-empty">No rows match your filter.</p>}
    </div>
  );
}
