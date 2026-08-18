import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AskAboutData } from './AskAboutData';
import * as claudeClient from './claudeClient';
import type { Dataset } from '../../types/dataset';

const dataset: Dataset = {
  columns: [{ key: 'score', label: 'score', type: 'number' }],
  rows: [{ score: 10 }, { score: 20 }],
};

function fillField(container: HTMLElement, tag: string, testId: string, value: string) {
  const host = container.querySelector(`${tag}[data-testid="${testId}"]`)!;
  fireEvent(host, new CustomEvent('ionInput', { detail: { value } }));
}

describe('AskAboutData', () => {
  it('disables the Ask button until an API key and question are entered', () => {
    render(<AskAboutData dataset={dataset} />);
    expect((screen.getByTestId('ask-button') as unknown as { disabled: boolean }).disabled).toBe(true);
  });

  it('calls askClaude with the dataset summary and renders the answer', async () => {
    const askClaudeSpy = vi.spyOn(claudeClient, 'askClaude').mockResolvedValue('Scores are rising.');
    const { container } = render(<AskAboutData dataset={dataset} />);

    fillField(container, 'ion-input', 'api-key-input', 'test-key');
    fillField(container, 'ion-textarea', 'question-input', 'What is the trend?');

    await userEvent.click(screen.getByTestId('ask-button'));

    await waitFor(() => expect(screen.getByText('Scores are rising.')).toBeInTheDocument());
    expect(askClaudeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'test-key', question: 'What is the trend?' })
    );
  });

  it('shows an error message when askClaude rejects', async () => {
    vi.spyOn(claudeClient, 'askClaude').mockRejectedValue(new Error('Claude API error (401): bad key'));
    const { container } = render(<AskAboutData dataset={dataset} />);

    fillField(container, 'ion-input', 'api-key-input', 'bad-key');
    fillField(container, 'ion-textarea', 'question-input', 'Why?');

    await userEvent.click(screen.getByTestId('ask-button'));

    await waitFor(() => expect(screen.getByText('Claude API error (401): bad key')).toBeInTheDocument());
  });
});
