import { describe, expect, it } from 'vitest';
import { buildDatasetSummary } from './buildDatasetSummary';
import type { Dataset } from '../types/dataset';

describe('buildDatasetSummary', () => {
  it('summarizes row count, columns, numeric stats, and a capped row sample', () => {
    const dataset: Dataset = {
      columns: [
        { key: 'name', label: 'name', type: 'string' },
        { key: 'score', label: 'score', type: 'number' },
      ],
      rows: Array.from({ length: 8 }, (_, i) => ({ name: `Person ${i}`, score: i * 10 })),
    };

    const summary = buildDatasetSummary(dataset);

    expect(summary.rowCount).toBe(8);
    expect(summary.columns).toEqual([
      { key: 'name', label: 'name', type: 'string' },
      { key: 'score', label: 'score', type: 'number' },
    ]);
    expect(summary.numericStats).toEqual([
      { key: 'score', count: 8, min: 0, max: 70, avg: 35, sum: 280 },
    ]);
    expect(summary.sampleRows).toHaveLength(5);
    expect(summary.sampleRows[0]).toEqual({ name: 'Person 0', score: 0 });
  });
});
