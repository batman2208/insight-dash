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
import './ChartPanel.css';

export interface ChartPanelProps {
  dataset: Dataset;
}

type ChartType = 'bar' | 'line';

const CHART_COLOR = 'var(--ion-color-primary, #4f46e5)';
const AXIS_COLOR = 'var(--ion-color-step-500, #9199a8)';
const GRID_COLOR = 'var(--app-border-color, #e5e7eb)';
const MIN_POINT_WIDTH = 36;
const MAX_TICKS = 12;

export function ChartPanel({ dataset }: ChartPanelProps) {
  const numericKeys = getNumericColumnKeys(dataset);
  const [column, setColumn] = useState<string | undefined>(numericKeys[0]);
  const [chartType, setChartType] = useState<ChartType>('bar');

  if (numericKeys.length === 0) {
    return <p className="chart-panel-empty">No numeric columns available to chart.</p>;
  }

  const activeColumn = column && numericKeys.includes(column) ? column : numericKeys[0];
  const data = dataset.rows.map((row, index) => ({
    index: index + 1,
    value: row[activeColumn] as number,
  }));
  const chartMinWidth = data.length * MIN_POINT_WIDTH;
  const tickInterval = Math.max(0, Math.ceil(data.length / MAX_TICKS) - 1);

  const sharedAxes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
      <XAxis dataKey="index" tick={{ fontSize: 12 }} stroke={AXIS_COLOR} interval={tickInterval} />
      <YAxis tick={{ fontSize: 12 }} stroke={AXIS_COLOR} />
      <Tooltip contentStyle={{ borderRadius: 8, borderColor: GRID_COLOR, fontSize: 13 }} />
    </>
  );

  return (
    <div className="chart-panel">
      <div className="chart-panel-toolbar">
        <IonSelect
          value={activeColumn}
          placeholder="Select column"
          interface="popover"
          className="chart-panel-select"
          onIonChange={(e) => setColumn(e.detail.value)}
        >
          {numericKeys.map((key) => (
            <IonSelectOption key={key} value={key}>
              {key}
            </IonSelectOption>
          ))}
        </IonSelect>
        <IonSegment
          value={chartType}
          className="chart-panel-segment"
          onIonChange={(e) => setChartType(e.detail.value as ChartType)}
        >
          <IonSegmentButton value="bar">
            <IonLabel>Bar</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="line">
            <IonLabel>Line</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </div>
      <div className="chart-panel-canvas">
        <div className="chart-panel-canvas-inner" style={{ minWidth: `${chartMinWidth}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={data}>
                {sharedAxes}
                <Bar dataKey="value" fill={CHART_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={data}>
                {sharedAxes}
                <Line type="monotone" dataKey="value" stroke={CHART_COLOR} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
