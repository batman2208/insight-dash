import type { ClaudeModel, DatasetSummary } from '../../types/ai';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export interface AskClaudeParams {
  apiKey: string;
  model: ClaudeModel;
  question: string;
  summary: DatasetSummary;
}

function buildPrompt(question: string, summary: DatasetSummary): string {
  return [
    'You are analyzing a dataset for a user. Here is a summary of the dataset:',
    JSON.stringify(summary, null, 2),
    '',
    `Question: ${question}`,
  ].join('\n');
}

export async function askClaude({ apiKey, model, question, summary }: AskClaudeParams): Promise<string> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildPrompt(question, summary) }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Claude API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (typeof text !== 'string') {
    throw new Error('Unexpected response shape from Claude API.');
  }
  return text;
}
