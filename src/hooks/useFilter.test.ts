import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFilter } from './useFilter';
import type { Row } from '../types/dataset';

const rows: Row[] = [
  { name: 'Ada Lovelace', score: 30 },
  { name: 'Grace Hopper', score: 20 },
  { name: 'Alan Turing', score: 10 },
];

describe('useFilter', () => {
  it('returns all rows when the filter text is empty', () => {
    const { result } = renderHook(() => useFilter(rows));
    expect(result.current.filteredRows).toEqual(rows);
  });

  it('filters rows by a case-insensitive substring match across all columns', () => {
    const { result } = renderHook(() => useFilter(rows));
    act(() => result.current.setFilterText('grace'));
    expect(result.current.filteredRows).toEqual([{ name: 'Grace Hopper', score: 20 }]);
  });

  it('matches against numeric column values too', () => {
    const { result } = renderHook(() => useFilter(rows));
    act(() => result.current.setFilterText('30'));
    expect(result.current.filteredRows).toEqual([{ name: 'Ada Lovelace', score: 30 }]);
  });

  it('returns an empty array when nothing matches', () => {
    const { result } = renderHook(() => useFilter(rows));
    act(() => result.current.setFilterText('nonexistent'));
    expect(result.current.filteredRows).toEqual([]);
  });
});
