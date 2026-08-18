import { IonButton, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { cloudUploadOutline, statsChartOutline, trashOutline } from 'ionicons/icons';
import { useDataset } from '../hooks/useDataset';
import { FileUpload } from '../components/FileUpload/FileUpload';
import { DataTable } from '../components/DataTable/DataTable';
import { ChartPanel } from '../components/ChartPanel/ChartPanel';
import { AskAboutData } from '../components/AskAboutData/AskAboutData';
import './Home.css';

export function Home() {
  const { dataset, error, isLoading, loadFromFile, loadSample, clear } = useDataset();

  return (
    <IonPage>
      <IonHeader className="app-header">
        <IonToolbar>
          <IonTitle>
            <span className="app-brand">
              <IonIcon icon={statsChartOutline} />
              Insight Dash
            </span>
          </IonTitle>
          {dataset && (
            <IonButton slot="end" fill="clear" size="small" onClick={clear}>
              <IonIcon slot="start" icon={trashOutline} />
              Clear dataset
            </IonButton>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent className="app-content">
        <div className="app-shell">
          <section className="panel panel-upload">
            <FileUpload
              onFileSelected={loadFromFile}
              onLoadSample={loadSample}
              isLoading={isLoading}
              error={error}
            />
          </section>

          {dataset ? (
            <>
              <section className="panel">
                <h2 className="panel-title">Data table</h2>
                <DataTable columns={dataset.columns} rows={dataset.rows} />
              </section>
              <section className="panel">
                <h2 className="panel-title">Chart</h2>
                <ChartPanel dataset={dataset} />
              </section>
              <section className="panel">
                <h2 className="panel-title">Ask about your data</h2>
                <AskAboutData dataset={dataset} />
              </section>
            </>
          ) : (
            <div className="empty-state">
              <IonIcon icon={cloudUploadOutline} className="empty-state-icon" />
              <h2>No dataset loaded yet</h2>
              <p>Upload a CSV or JSON file, or load the bundled sample data to get started.</p>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
