import { describe, expect, it } from 'vitest';
import { computeColumnStats, getNumericColumnKeys } from './stats';
import type { Dataset } from '../types/dataset';

const dataset: Dataset = {
  columns: [
    { key: 'name', label: 'name', type: 'string' },
    { key: 'score', label: 'score', type: 'number' },
  ],
  rows: [
    { name: 'Ada', score: 10 },
    { name: 'Grace', score: 20 },
    { name: 'Alan', score: 30 },
  ],
};

describe('computeColumnStats', () => {
  it('computes count, min, max, avg, and sum for a numeric column', () => {
    expect(computeColumnStats(dataset, 'score')).toEqual({
      key: 'score',
      count: 3,
      min: 10,
      max: 30,
      avg: 20,
      sum: 60,
    });
  });

  it('returns zeroed stats when the column has no numeric values', () => {
    expect(computeColumnStats(dataset, 'name')).toEqual({
      key: 'name',
      count: 0,
      min: 0,
      max: 0,
      avg: 0,
      sum: 0,
    });
  });
});

describe('getNumericColumnKeys', () => {
  it('returns only the keys of number-typed columns', () => {
    expect(getNumericColumnKeys(dataset)).toEqual(['score']);
  });
});
