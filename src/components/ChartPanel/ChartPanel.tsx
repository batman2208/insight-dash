import { useState } from 'react';
import { IonLabel, IonSegment, IonSegmentButton, IonSelect, IonSelectOption } from '@ionic/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getNumericColumnKeys } from '../../utils/stats';
import type { Dataset } from '../../types/dataset';

export interface ChartPanelProps {
  dataset: Dataset;
}

type ChartType = 'bar' | 'line';

export function ChartPanel({ dataset }: ChartPanelProps) {
  const numericKeys = getNumericColumnKeys(dataset);
  const [column, setColumn] = useState<string | undefined>(numericKeys[0]);
  const [chartType, setChartType] = useState<ChartType>('bar');

  if (numericKeys.length === 0) {
    return <p>No numeric columns available to chart.</p>;
  }

  const activeColumn = column ?? numericKeys[0];
  const data = dataset.rows.map((row, index) => ({
    index: index + 1,
    value: row[activeColumn] as number,
  }));

  return (
    <div>
      <IonSelect
        value={activeColumn}
        placeholder="Select column"
        onIonChange={(e) => setColumn(e.detail.value)}
      >
        {numericKeys.map((key) => (
          <IonSelectOption key={key} value={key}>
            {key}
          </IonSelectOption>
        ))}
      </IonSelect>
      <IonSegment value={chartType} onIonChange={(e) => setChartType(e.detail.value as ChartType)}>
        <IonSegmentButton value="bar">
          <IonLabel>Bar</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="line">
          <IonLabel>Line</IonLabel>
        </IonSegmentButton>
      </IonSegment>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          {chartType === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3880ff" />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3880ff" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
