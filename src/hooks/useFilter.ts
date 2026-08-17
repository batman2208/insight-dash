import { useMemo, useState } from 'react';
import type { Row } from '../types/dataset';

export interface UseFilterResult {
  filteredRows: Row[];
  filterText: string;
  setFilterText: (text: string) => void;
}

export function useFilter(rows: Row[]): UseFilterResult {
  const [filterText, setFilterText] = useState('');

  const filteredRows = useMemo(() => {
    const query = filterText.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(query))
    );
  }, [rows, filterText]);

  return { filteredRows, filterText, setFilterText };
}
