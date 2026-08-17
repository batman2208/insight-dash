export type ColumnType = 'number' | 'string';

export interface ColumnDef {
  key: string;
  label: string;
  type: ColumnType;
}

export type Row = Record<string, string | number>;

export interface Dataset {
  columns: ColumnDef[];
  rows: Row[];
}

export type SortDirection = 'asc' | 'desc' | null;

export interface RawTable {
  headers: string[];
  rows: Record<string, string | number>[];
}

export interface ColumnStats {
  key: string;
  count: number;
  min: number;
  max: number;
  avg: number;
  sum: number;
}
