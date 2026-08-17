import type { ColumnStats, ColumnType } from './dataset';

export type ClaudeModel = 'claude-sonnet-5' | 'claude-haiku-4-5-20251001';

export interface DatasetSummary {
  rowCount: number;
  columns: { key: string; label: string; type: ColumnType }[];
  numericStats: ColumnStats[];
  sampleRows: Record<string, string | number>[];
}

export interface AskAboutDataResult {
  answer: string;
}
