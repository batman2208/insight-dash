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
    <div>
      <IonSearchbar
        value={filterText}
        onIonInput={(e) => setFilterText(e.detail.value ?? '')}
        placeholder="Filter rows"
      />
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} onClick={() => toggleSort(column.key)} style={{ cursor: 'pointer' }}>
                  {column.label}
                  <IonIcon icon={sortIcon(column.key)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key}>{row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedRows.length === 0 && <p>No rows match your filter.</p>}
    </div>
  );
}
