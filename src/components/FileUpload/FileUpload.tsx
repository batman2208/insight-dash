import { useRef, type ChangeEvent } from 'react';
import { IonButton, IonIcon, IonSpinner, IonText } from '@ionic/react';
import { cloudUploadOutline, documentTextOutline } from 'ionicons/icons';

export interface FileUploadProps {
  onFileSelected: (file: File) => void;
  onLoadSample: () => void;
  isLoading: boolean;
  error: string | null;
}

export function FileUpload({ onFileSelected, onLoadSample, isLoading, error }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onFileSelected(file);
    event.target.value = '';
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json"
        onChange={handleChange}
        style={{ display: 'none' }}
        data-testid="file-upload-input"
      />
      <IonButton onClick={() => inputRef.current?.click()} disabled={isLoading}>
        <IonIcon slot="start" icon={cloudUploadOutline} />
        Upload CSV or JSON
      </IonButton>
      <IonButton fill="outline" onClick={onLoadSample} disabled={isLoading}>
        <IonIcon slot="start" icon={documentTextOutline} />
        Load sample data
      </IonButton>
      {isLoading && <IonSpinner name="dots" />}
      {error && (
        <IonText color="danger">
          <p>{error}</p>
        </IonText>
      )}
    </div>
  );
}
