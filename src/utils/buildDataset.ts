import type { ColumnDef, Dataset, RawTable, Row } from '../types/dataset';

function isNumeric(value: string | number): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  if (value.trim() === '') return false;
  return Number.isFinite(Number(value));
}

export function buildDataset(raw: RawTable): Dataset {
  const columns: ColumnDef[] = raw.headers.map((key) => {
    const values = raw.rows
      .map((row) => row[key])
      .filter((value) => value !== '' && value !== undefined);
    const allNumeric = values.length > 0 && values.every(isNumeric);
    return { key, label: key, type: allNumeric ? 'number' : 'string' };
  });

  const rows: Row[] = raw.rows.map((rawRow) => {
    const row: Row = {};
    for (const column of columns) {
      const value = rawRow[column.key];
      row[column.key] =
        column.type === 'number' && value !== '' && value !== undefined
          ? Number(value)
          : (value ?? '');
    }
    return row;
  });

  return { columns, rows };
}
