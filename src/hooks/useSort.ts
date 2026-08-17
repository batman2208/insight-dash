import { useMemo, useState } from 'react';
import type { Row, SortDirection } from '../types/dataset';

export interface UseSortResult {
  sortedRows: Row[];
  sortColumn: string | null;
  sortDirection: SortDirection;
  toggleSort: (column: string) => void;
}

export function useSort(rows: Row[]): UseSortResult {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const toggleSort = (column: string) => {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortDirection('asc');
      return;
    }
    if (sortDirection === 'asc') {
      setSortDirection('desc');
      return;
    }
    setSortColumn(null);
    setSortDirection(null);
  };

  const sortedRows = useMemo(() => {
    if (!sortColumn || !sortDirection) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortColumn, sortDirection]);

  return { sortedRows, sortColumn, sortDirection, toggleSort };
}
