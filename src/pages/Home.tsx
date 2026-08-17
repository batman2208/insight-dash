import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

export function Home() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Insight Dash</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" />
    </IonPage>
  );
}
