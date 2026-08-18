import { useState } from 'react';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea,
} from '@ionic/react';
import { sparklesOutline } from 'ionicons/icons';
import { askClaude } from './claudeClient';
import { buildDatasetSummary } from '../../utils/buildDatasetSummary';
import type { ClaudeModel } from '../../types/ai';
import type { Dataset } from '../../types/dataset';
import './AskAboutData.css';

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
    <div className="ask-about-data">
      <p className="ask-about-data-hint">
        Your API key is used only for this request and is never stored or sent anywhere but Anthropic's API.
      </p>
      <IonItem className="ask-about-data-field" lines="none">
        <IonLabel position="stacked">Claude API key</IonLabel>
        <IonInput
          type="password"
          value={apiKey}
          onIonInput={(e) => setApiKey(e.detail.value ?? '')}
          placeholder="sk-ant-..."
          data-testid="api-key-input"
        />
      </IonItem>
      <IonItem className="ask-about-data-field" lines="none">
        <IonLabel position="stacked">Model</IonLabel>
        <IonSelect value={model} onIonChange={(e) => setModel(e.detail.value)}>
          <IonSelectOption value="claude-sonnet-5">claude-sonnet-5</IonSelectOption>
          <IonSelectOption value="claude-haiku-4-5-20251001">claude-haiku-4-5</IonSelectOption>
        </IonSelect>
      </IonItem>
      <IonItem className="ask-about-data-field" lines="none">
        <IonLabel position="stacked">Question</IonLabel>
        <IonTextarea
          value={question}
          onIonInput={(e) => setQuestion(e.detail.value ?? '')}
          placeholder="What trend do you see in this data?"
          data-testid="question-input"
          autoGrow
        />
      </IonItem>
      <IonButton onClick={handleAsk} disabled={!canSubmit} data-testid="ask-button" className="ask-about-data-submit">
        {isLoading ? (
          <IonSpinner name="dots" />
        ) : (
          <>
            <IonIcon slot="start" icon={sparklesOutline} />
            Ask
          </>
        )}
      </IonButton>
      {error && (
        <IonText color="danger">
          <p className="ask-about-data-error">{error}</p>
        </IonText>
      )}
      {answer && (
        <div className="ask-about-data-answer">
          <span className="ask-about-data-answer-label">Answer</span>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
