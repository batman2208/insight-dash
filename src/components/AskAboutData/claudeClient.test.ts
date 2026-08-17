import { afterEach, describe, expect, it, vi } from 'vitest';
import { askClaude } from './claudeClient';
import type { DatasetSummary } from '../../types/ai';

const summary: DatasetSummary = {
  rowCount: 1,
  columns: [{ key: 'score', label: 'score', type: 'number' }],
  numericStats: [{ key: 'score', count: 1, min: 1, max: 1, avg: 1, sum: 1 }],
  sampleRows: [{ score: 1 }],
};

describe('askClaude', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends the expected request and returns the response text', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ text: 'The score trends upward.' }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const answer = await askClaude({
      apiKey: 'test-key',
      model: 'claude-sonnet-5',
      question: 'What is the trend?',
      summary,
    });

    expect(answer).toBe('The score trends upward.');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect(options.headers['x-api-key']).toBe('test-key');
    expect(options.headers['anthropic-dangerous-direct-browser-access']).toBe('true');
    const body = JSON.parse(options.body);
    expect(body.model).toBe('claude-sonnet-5');
    expect(body.messages[0].content).toContain('What is the trend?');
  });

  it('throws a descriptive error when the API responds with an error status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'invalid x-api-key',
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      askClaude({ apiKey: 'bad-key', model: 'claude-sonnet-5', question: 'Why?', summary })
    ).rejects.toThrow('Claude API error (401): invalid x-api-key');
  });
});
