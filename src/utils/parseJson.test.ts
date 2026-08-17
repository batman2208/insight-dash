import { describe, expect, it } from 'vitest';
import { parseJson } from './parseJson';

describe('parseJson', () => {
  it('parses an array of flat objects', () => {
    const json = JSON.stringify([
      { name: 'Ada', age: 30 },
      { name: 'Grace', age: 32 },
    ]);
    const result = parseJson(json);
    expect(result.headers).toEqual(['name', 'age']);
    expect(result.rows).toEqual([
      { name: 'Ada', age: 30 },
      { name: 'Grace', age: 32 },
    ]);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseJson('{not valid')).toThrow('File is not valid JSON.');
  });

  it('throws on an empty array', () => {
    expect(() => parseJson('[]')).toThrow('JSON file must contain a non-empty array of records.');
  });

  it('throws when the array does not contain flat objects', () => {
    expect(() => parseJson('[1, 2, 3]')).toThrow('JSON array must contain flat objects.');
  });
});
