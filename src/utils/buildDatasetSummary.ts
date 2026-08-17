import type { Dataset } from '../types/dataset';
import type { DatasetSummary } from '../types/ai';
import { computeColumnStats, getNumericColumnKeys } from './stats';

const SAMPLE_ROW_COUNT = 5;

export function buildDatasetSummary(dataset: Dataset): DatasetSummary {
  const numericStats = getNumericColumnKeys(dataset).map((key) => computeColumnStats(dataset, key));

  return {
    rowCount: dataset.rows.length,
    columns: dataset.columns.map(({ key, label, type }) => ({ key, label, type })),
    numericStats,
    sampleRows: dataset.rows.slice(0, SAMPLE_ROW_COUNT),
  };
}
