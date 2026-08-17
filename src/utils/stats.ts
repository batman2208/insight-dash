import type { ColumnStats, Dataset } from '../types/dataset';

export function computeColumnStats(dataset: Dataset, columnKey: string): ColumnStats {
  const values = dataset.rows
    .map((row) => row[columnKey])
    .filter((value): value is number => typeof value === 'number');

  if (values.length === 0) {
    return { key: columnKey, count: 0, min: 0, max: 0, avg: 0, sum: 0 };
  }

  const sum = values.reduce((total, value) => total + value, 0);
  return {
    key: columnKey,
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    avg: sum / values.length,
    sum,
  };
}

export function getNumericColumnKeys(dataset: Dataset): string[] {
  return dataset.columns.filter((column) => column.type === 'number').map((column) => column.key);
}
