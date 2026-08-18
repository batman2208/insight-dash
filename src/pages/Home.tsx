import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useDataset } from '../hooks/useDataset';
import { FileUpload } from '../components/FileUpload/FileUpload';
import { DataTable } from '../components/DataTable/DataTable';
import { ChartPanel } from '../components/ChartPanel/ChartPanel';
import { AskAboutData } from '../components/AskAboutData/AskAboutData';

export function Home() {
  const { dataset, error, isLoading, loadFromFile, loadSample, clear } = useDataset();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Insight Dash</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <FileUpload
          onFileSelected={loadFromFile}
          onLoadSample={loadSample}
          isLoading={isLoading}
          error={error}
        />
        {dataset && (
          <>
            <IonButton fill="clear" onClick={clear}>
              Clear dataset
            </IonButton>
            <DataTable columns={dataset.columns} rows={dataset.rows} />
            <ChartPanel dataset={dataset} />
            <AskAboutData dataset={dataset} />
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
