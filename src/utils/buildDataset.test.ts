import { describe, expect, it } from 'vitest';
import { buildDataset } from './buildDataset';

describe('buildDataset', () => {
  it('infers a numeric column and coerces its values to numbers', () => {
    const dataset = buildDataset({
      headers: ['name', 'age'],
      rows: [
        { name: 'Ada', age: '30' },
        { name: 'Grace', age: '32' },
      ],
    });

    expect(dataset.columns).toEqual([
      { key: 'name', label: 'name', type: 'string' },
      { key: 'age', label: 'age', type: 'number' },
    ]);
    expect(dataset.rows).toEqual([
      { name: 'Ada', age: 30 },
      { name: 'Grace', age: 32 },
    ]);
  });

  it('treats a column with any non-numeric value as a string column', () => {
    const dataset = buildDataset({
      headers: ['code'],
      rows: [{ code: '007' }, { code: 'N/A' }],
    });

    expect(dataset.columns).toEqual([{ key: 'code', label: 'code', type: 'string' }]);
    expect(dataset.rows).toEqual([{ code: '007' }, { code: 'N/A' }]);
  });

  it('handles empty string values in an otherwise numeric column', () => {
    const dataset = buildDataset({
      headers: ['score'],
      rows: [{ score: '10' }, { score: '' }],
    });

    expect(dataset.columns).toEqual([{ key: 'score', label: 'score', type: 'number' }]);
    expect(dataset.rows).toEqual([{ score: 10 }, { score: '' }]);
  });
});
