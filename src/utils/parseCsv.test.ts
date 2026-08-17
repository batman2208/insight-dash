import { describe, expect, it } from 'vitest';
import { parseCsv } from './parseCsv';

describe('parseCsv', () => {
  it('parses a basic CSV with a header row', () => {
    const csv = 'name,age\nAda,30\nGrace,32';
    const result = parseCsv(csv);
    expect(result.headers).toEqual(['name', 'age']);
    expect(result.rows).toEqual([
      { name: 'Ada', age: '30' },
      { name: 'Grace', age: '32' },
    ]);
  });

  it('handles quoted fields containing commas', () => {
    const csv = 'name,note\n"Doe, Jane","hello, world"';
    const result = parseCsv(csv);
    expect(result.rows).toEqual([{ name: 'Doe, Jane', note: 'hello, world' }]);
  });

  it('throws on an empty file', () => {
    expect(() => parseCsv('')).toThrow('CSV file has no header row.');
  });
});
