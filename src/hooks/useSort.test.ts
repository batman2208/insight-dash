import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSort } from './useSort';
import type { Row } from '../types/dataset';

const rows: Row[] = [
  { name: 'Grace', score: 20 },
  { name: 'Ada', score: 30 },
  { name: 'Alan', score: 10 },
];

describe('useSort', () => {
  it('returns rows unsorted by default', () => {
    const { result } = renderHook(() => useSort(rows));
    expect(result.current.sortedRows).toEqual(rows);
    expect(result.current.sortColumn).toBeNull();
    expect(result.current.sortDirection).toBeNull();
  });

  it('cycles a column through asc, desc, then unsorted', () => {
    const { result } = renderHook(() => useSort(rows));

    act(() => result.current.toggleSort('score'));
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.sortedRows.map((r) => r.score)).toEqual([10, 20, 30]);

    act(() => result.current.toggleSort('score'));
    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.sortedRows.map((r) => r.score)).toEqual([30, 20, 10]);

    act(() => result.current.toggleSort('score'));
    expect(result.current.sortDirection).toBeNull();
    expect(result.current.sortColumn).toBeNull();
    expect(result.current.sortedRows).toEqual(rows);
  });

  it('sorts string columns alphabetically', () => {
    const { result } = renderHook(() => useSort(rows));
    act(() => result.current.toggleSort('name'));
    expect(result.current.sortedRows.map((r) => r.name)).toEqual(['Ada', 'Alan', 'Grace']);
  });

  it('switching to a new column resets to ascending', () => {
    const { result } = renderHook(() => useSort(rows));
    act(() => result.current.toggleSort('score'));
    act(() => result.current.toggleSort('score'));
    act(() => result.current.toggleSort('name'));
    expect(result.current.sortColumn).toBe('name');
    expect(result.current.sortDirection).toBe('asc');
  });
});
