import Papa from 'papaparse';
import type { RawTable } from '../types/dataset';

export function parseCsv(text: string): RawTable {
  const result = Papa.parse<Record<string, string>>(text.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  const headers = result.meta.fields ?? [];
  if (headers.length === 0) {
    throw new Error('CSV file has no header row.');
  }

  if (result.errors.length > 0) {
    throw new Error(`Failed to parse CSV: ${result.errors[0].message}`);
  }

  return { headers, rows: result.data };
}
