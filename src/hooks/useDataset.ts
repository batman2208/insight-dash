import { useState } from 'react';
import { buildDataset } from '../utils/buildDataset';
import { parseCsv } from '../utils/parseCsv';
import { parseJson } from '../utils/parseJson';
import type { Dataset } from '../types/dataset';
import sampleCsv from '../assets/sample-data.csv?raw';

export interface UseDatasetResult {
  dataset: Dataset | null;
  error: string | null;
  isLoading: boolean;
  loadFromFile: (file: File) => Promise<void>;
  loadSample: () => void;
  clear: () => void;
}

function parseText(text: string, fileName: string): Dataset {
  const isJson = fileName.toLowerCase().endsWith('.json');
  const raw = isJson ? parseJson(text) : parseCsv(text);
  return buildDataset(raw);
}

export function useDataset(): UseDatasetResult {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadFromFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const text = await file.text();
      setDataset(parseText(text, file.name));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file.');
      setDataset(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = () => {
    setError(null);
    try {
      setDataset(parseText(sampleCsv, 'sample-data.csv'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sample data.');
    }
  };

  const clear = () => {
    setDataset(null);
    setError(null);
  };

  return { dataset, error, isLoading, loadFromFile, loadSample, clear };
}
