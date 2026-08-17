import type { RawTable } from '../types/dataset';

export function parseJson(text: string): RawTable {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('File is not valid JSON.');
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('JSON file must contain a non-empty array of records.');
  }

  const first = parsed[0];
  if (typeof first !== 'object' || first === null || Array.isArray(first)) {
    throw new Error('JSON array must contain flat objects.');
  }

  const headers = Object.keys(first as Record<string, unknown>);
  const rows = (parsed as Record<string, unknown>[]).map((record) => {
    const row: Record<string, string | number> = {};
    for (const key of headers) {
      const value = record[key];
      row[key] = typeof value === 'number' ? value : String(value ?? '');
    }
    return row;
  });

  return { headers, rows };
}
