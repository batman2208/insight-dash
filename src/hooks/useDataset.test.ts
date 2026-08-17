import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDataset } from './useDataset';

function makeFile(content: string, name: string): File {
  return new File([content], name, { type: 'text/plain' });
}

describe('useDataset', () => {
  it('starts with no dataset loaded', () => {
    const { result } = renderHook(() => useDataset());
    expect(result.current.dataset).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('loads a dataset from an uploaded CSV file', async () => {
    const { result } = renderHook(() => useDataset());
    const file = makeFile('name,age\nAda,30', 'people.csv');

    await act(async () => {
      await result.current.loadFromFile(file);
    });

    await waitFor(() => expect(result.current.dataset).not.toBeNull());
    expect(result.current.dataset?.rows).toEqual([{ name: 'Ada', age: 30 }]);
    expect(result.current.error).toBeNull();
  });

  it('loads a dataset from an uploaded JSON file', async () => {
    const { result } = renderHook(() => useDataset());
    const file = makeFile(JSON.stringify([{ name: 'Ada', age: 30 }]), 'people.json');

    await act(async () => {
      await result.current.loadFromFile(file);
    });

    await waitFor(() => expect(result.current.dataset).not.toBeNull());
    expect(result.current.dataset?.rows).toEqual([{ name: 'Ada', age: 30 }]);
  });

  it('sets an error and clears the dataset on invalid input', async () => {
    const { result } = renderHook(() => useDataset());
    const file = makeFile('{not valid', 'bad.json');

    await act(async () => {
      await result.current.loadFromFile(file);
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.dataset).toBeNull();
  });

  it('loads the bundled sample dataset', () => {
    const { result } = renderHook(() => useDataset());
    act(() => result.current.loadSample());
    expect(result.current.dataset).not.toBeNull();
    expect(result.current.dataset?.rows.length).toBeGreaterThan(0);
  });

  it('clear resets the dataset and error', () => {
    const { result } = renderHook(() => useDataset());
    act(() => result.current.loadSample());
    act(() => result.current.clear());
    expect(result.current.dataset).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
