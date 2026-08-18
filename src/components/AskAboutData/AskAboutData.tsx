import { useState } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea,
} from '@ionic/react';
import { askClaude } from './claudeClient';
import { buildDatasetSummary } from '../../utils/buildDatasetSummary';
import type { ClaudeModel } from '../../types/ai';
import type { Dataset } from '../../types/dataset';

export interface AskAboutDataProps {
  dataset: Dataset;
}

export function AskAboutData({ dataset }: AskAboutDataProps) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState<ClaudeModel>('claude-sonnet-5');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = apiKey.trim().length > 0 && question.trim().length > 0 && !isLoading;

  const handleAsk = async () => {
    setIsLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const summary = buildDatasetSummary(dataset);
      const result = await askClaude({ apiKey, model, question, summary });
      setAnswer(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get a response.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <IonItem>
        <IonLabel position="stacked">Claude API key</IonLabel>
        <IonInput
          type="password"
          value={apiKey}
          onIonInput={(e) => setApiKey(e.detail.value ?? '')}
          placeholder="sk-ant-..."
          data-testid="api-key-input"
        />
      </IonItem>
      <IonItem>
        <IonLabel position="stacked">Model</IonLabel>
        <IonSelect value={model} onIonChange={(e) => setModel(e.detail.value)}>
          <IonSelectOption value="claude-sonnet-5">claude-sonnet-5</IonSelectOption>
          <IonSelectOption value="claude-haiku-4-5-20251001">claude-haiku-4-5</IonSelectOption>
        </IonSelect>
      </IonItem>
      <IonItem>
        <IonLabel position="stacked">Question</IonLabel>
        <IonTextarea
          value={question}
          onIonInput={(e) => setQuestion(e.detail.value ?? '')}
          placeholder="What trend do you see in this data?"
          data-testid="question-input"
        />
      </IonItem>
      <IonButton onClick={handleAsk} disabled={!canSubmit} data-testid="ask-button">
        {isLoading ? <IonSpinner name="dots" /> : 'Ask'}
      </IonButton>
      {error && (
        <IonText color="danger">
          <p>{error}</p>
        </IonText>
      )}
      {answer && (
        <IonCard>
          <IonCardContent>{answer}</IonCardContent>
        </IonCard>
      )}
    </div>
  );
}
