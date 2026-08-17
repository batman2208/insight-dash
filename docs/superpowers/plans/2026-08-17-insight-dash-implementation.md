# Insight Dash Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Insight Dash, a client-side Ionic + React + TypeScript + Capacitor data dashboard: upload CSV/JSON, view a sortable/filterable table, chart a numeric column, and optionally ask Claude a question about the dataset.

**Architecture:** A single-route Ionic app. `useDataset` owns the loaded `Dataset` and is the only source of truth; `DataTable` composes `useSort` + `useFilter` internally; `ChartPanel` and `AskAboutData` both read the same `Dataset` directly. Parsing (CSV via `papaparse`, JSON via native `JSON.parse`) produces a common `RawTable` shape that `buildDataset` turns into typed `Dataset` rows.

**Tech Stack:** Vite, React, TypeScript, `@ionic/react` + `@ionic/react-router`, `ionicons`, `react-router-dom`, `papaparse`, `recharts`, `@capacitor/core` + `@capacitor/android`, Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-17-insight-dash-design.md`

## Global Constraints

- No backend of any kind — all parsing/computation is client-side; the only network call is the optional direct-from-browser Claude API request.
- No persistence — no localStorage/IndexedDB anywhere, and the Claude API key must never be written to storage, only held in component state for the session.
- No mention of any company, role, or interview anywhere in code, comments, README, commit messages, or file names.
- CSV parsing uses `papaparse`, not a hand-rolled splitter.
- Chart uses `recharts`.
- The bundled sample dataset lives at `src/assets/sample-data.csv` and is imported with Vite's `?raw` suffix (not fetched from `public/`), so it works identically in tests, web, and the Capacitor build with no network/mocking needed.
- Every feature task is TDD: write the failing test first, watch it fail, implement, watch it pass, then commit.
- Commit after every task with a clear, generic commit message (no placeholders like "wip").

---

### Task 1: Project scaffold

**Files:**
- Create: whole project via `create-vite`, then:
- Create: `vite.config.ts` (modify generated one to add Vitest config)
- Create: `src/setupTests.ts`
- Create: `src/pages/Home.tsx` (placeholder — full version in Task 14)
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Create: `src/App.test.tsx`
- Delete: `src/App.css`, `src/assets/react.svg`, default boilerplate markup in `App.tsx`/`index.css` left by the template

**Interfaces:**
- Produces: a working `npm run dev`, `npm run build`, and `npm test` (Vitest) pipeline that every later task relies on. Produces the placeholder `Home` component other tasks will replace.

- [ ] **Step 1: Scaffold the Vite + React + TypeScript project**

Run:
```bash
npm create vite@latest . -- --template react-ts --overwrite
npm install
```

- [ ] **Step 2: Install runtime and dev dependencies**

Run:
```bash
npm install @ionic/react @ionic/react-router ionicons react-router-dom papaparse recharts @capacitor/core @capacitor/android
npm install -D @capacitor/cli @types/papaparse vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Add Vitest config to `vite.config.ts`**

Open the generated `vite.config.ts` and replace its contents with:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
});
```

- [ ] **Step 4: Add test setup file**

Create `src/setupTests.ts`:

```ts
import '@testing-library/jest-dom';
import { setupIonicReact } from '@ionic/react';

setupIonicReact();
```

- [ ] **Step 5: Add `test` scripts to `package.json`**

In the `"scripts"` section of `package.json`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Replace `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 7: Create placeholder `src/pages/Home.tsx`**

```tsx
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
```

- [ ] **Step 8: Replace `src/App.tsx`**

```tsx
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { Home } from './pages/Home';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

setupIonicReact();

export function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/" component={Home} />
          <Redirect exact from="*" to="/" />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}
```

- [ ] **Step 9: Remove unused template files**

Run:
```bash
rm -f src/App.css src/assets/react.svg
```
Delete their imports from `src/App.tsx` and `src/main.tsx` if `create-vite` left any (there should be none after Steps 6/8 replaced those files entirely).

- [ ] **Step 10: Write the scaffold smoke test**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the Insight Dash title', () => {
    render(<App />);
    expect(screen.getByText('Insight Dash')).toBeInTheDocument();
  });
});
```

- [ ] **Step 11: Run the test suite and verify it passes**

Run: `npm test`
Expected: 1 test file, 1 test, PASS.

- [ ] **Step 12: Verify the production build succeeds**

Run: `npm run build`
Expected: build completes with no TypeScript or bundling errors.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "Scaffold Vite + Ionic React + TypeScript project with Vitest wired up"
```

---

### Task 2: Shared types

**Files:**
- Create: `src/types/dataset.ts`
- Create: `src/types/ai.ts`

**Interfaces:**
- Produces: `ColumnType`, `ColumnDef`, `Row`, `Dataset`, `SortDirection`, `RawTable`, `ColumnStats` (from `dataset.ts`); `ClaudeModel`, `DatasetSummary`, `AskAboutDataResult` (from `ai.ts`). Every later task imports these exact names.

- [ ] **Step 1: Create `src/types/dataset.ts`**

```ts
export type ColumnType = 'number' | 'string';

export interface ColumnDef {
  key: string;
  label: string;
  type: ColumnType;
}

export type Row = Record<string, string | number>;

export interface Dataset {
  columns: ColumnDef[];
  rows: Row[];
}

export type SortDirection = 'asc' | 'desc' | null;

export interface RawTable {
  headers: string[];
  rows: Record<string, string | number>[];
}

export interface ColumnStats {
  key: string;
  count: number;
  min: number;
  max: number;
  avg: number;
  sum: number;
}
```

- [ ] **Step 2: Create `src/types/ai.ts`**

```ts
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
```

- [ ] **Step 3: Verify the project still type-checks**

Run: `npx tsc --noEmit`
Expected: no errors (these files aren't imported anywhere yet, so this just confirms they're syntactically valid TypeScript).

- [ ] **Step 4: Commit**

```bash
git add src/types
git commit -m "Add shared Dataset and AI request/response types"
```

---

### Task 3: CSV and JSON parsing utilities

**Files:**
- Create: `src/utils/parseCsv.ts`
- Create: `src/utils/parseCsv.test.ts`
- Create: `src/utils/parseJson.ts`
- Create: `src/utils/parseJson.test.ts`

**Interfaces:**
- Consumes: `RawTable` from `src/types/dataset.ts`.
- Produces: `parseCsv(text: string): RawTable` and `parseJson(text: string): RawTable`, both used by `useDataset` in Task 8. Both throw a plain `Error` with a human-readable message on invalid input.

- [ ] **Step 1: Write the failing tests for `parseCsv`**

Create `src/utils/parseCsv.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseCsv } from './parseCsv';

describe('parseCsv', () => {
  it('parses a basic CSV with a header row', () => {
    const csv = 'name,age\nAda,30\nGrace,32';
    const result = parseCsv(csv);
    expect(result.headers).toEqual(['name', 'age']);
    expect(result.rows).toEqual([
      { name: 'Ada', age: '30' },
      { name: 'Grace', age: '32' },
    ]);
  });

  it('handles quoted fields containing commas', () => {
    const csv = 'name,note\n"Doe, Jane","hello, world"';
    const result = parseCsv(csv);
    expect(result.rows).toEqual([{ name: 'Doe, Jane', note: 'hello, world' }]);
  });

  it('throws on an empty file', () => {
    expect(() => parseCsv('')).toThrow('CSV file has no header row.');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/utils/parseCsv.test.ts`
Expected: FAIL — `parseCsv` is not defined / module not found.

- [ ] **Step 3: Implement `parseCsv`**

Create `src/utils/parseCsv.ts`:

```ts
import Papa from 'papaparse';
import type { RawTable } from '../types/dataset';

export function parseCsv(text: string): RawTable {
  const result = Papa.parse<Record<string, string>>(text.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new Error(`Failed to parse CSV: ${result.errors[0].message}`);
  }

  const headers = result.meta.fields ?? [];
  if (headers.length === 0) {
    throw new Error('CSV file has no header row.');
  }

  return { headers, rows: result.data };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/utils/parseCsv.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing tests for `parseJson`**

Create `src/utils/parseJson.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseJson } from './parseJson';

describe('parseJson', () => {
  it('parses an array of flat objects', () => {
    const json = JSON.stringify([
      { name: 'Ada', age: 30 },
      { name: 'Grace', age: 32 },
    ]);
    const result = parseJson(json);
    expect(result.headers).toEqual(['name', 'age']);
    expect(result.rows).toEqual([
      { name: 'Ada', age: 30 },
      { name: 'Grace', age: 32 },
    ]);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseJson('{not valid')).toThrow('File is not valid JSON.');
  });

  it('throws on an empty array', () => {
    expect(() => parseJson('[]')).toThrow('JSON file must contain a non-empty array of records.');
  });

  it('throws when the array does not contain flat objects', () => {
    expect(() => parseJson('[1, 2, 3]')).toThrow('JSON array must contain flat objects.');
  });
});
```

- [ ] **Step 6: Run the tests to verify they fail**

Run: `npx vitest run src/utils/parseJson.test.ts`
Expected: FAIL — `parseJson` is not defined / module not found.

- [ ] **Step 7: Implement `parseJson`**

Create `src/utils/parseJson.ts`:

```ts
import type { RawTable } from '../types/dataset';

export function parseJson(text: string): RawTable {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('File is not valid JSON.');
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('JSON file must contain a non-empty array of records.');
  }

  const first = parsed[0];
  if (typeof first !== 'object' || first === null || Array.isArray(first)) {
    throw new Error('JSON array must contain flat objects.');
  }

  const headers = Object.keys(first as Record<string, unknown>);
  const rows = (parsed as Record<string, unknown>[]).map((record) => {
    const row: Record<string, string | number> = {};
    for (const key of headers) {
      const value = record[key];
      row[key] = typeof value === 'number' ? value : String(value ?? '');
    }
    return row;
  });

  return { headers, rows };
}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npx vitest run src/utils/parseJson.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 9: Commit**

```bash
git add src/utils/parseCsv.ts src/utils/parseCsv.test.ts src/utils/parseJson.ts src/utils/parseJson.test.ts
git commit -m "Add CSV and JSON parsing utilities"
```

---

### Task 4: Dataset construction and the bundled sample dataset

**Files:**
- Create: `src/utils/buildDataset.ts`
- Create: `src/utils/buildDataset.test.ts`
- Create: `src/assets/sample-data.csv`
- Create: `src/vite-env.d.ts` addition (custom module declaration for `*.csv?raw`)

**Interfaces:**
- Consumes: `RawTable`, `Dataset`, `ColumnDef`, `Row` from `src/types/dataset.ts`.
- Produces: `buildDataset(raw: RawTable): Dataset`, used by `useDataset` in Task 8. Produces the bundled sample CSV that Task 8 imports via `sample-data.csv?raw`.

- [ ] **Step 1: Write the failing tests for `buildDataset`**

Create `src/utils/buildDataset.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildDataset } from './buildDataset';

describe('buildDataset', () => {
  it('infers a numeric column and coerces its values to numbers', () => {
    const dataset = buildDataset({
      headers: ['name', 'age'],
      rows: [
        { name: 'Ada', age: '30' },
        { name: 'Grace', age: '32' },
      ],
    });

    expect(dataset.columns).toEqual([
      { key: 'name', label: 'name', type: 'string' },
      { key: 'age', label: 'age', type: 'number' },
    ]);
    expect(dataset.rows).toEqual([
      { name: 'Ada', age: 30 },
      { name: 'Grace', age: 32 },
    ]);
  });

  it('treats a column with any non-numeric value as a string column', () => {
    const dataset = buildDataset({
      headers: ['code'],
      rows: [{ code: '007' }, { code: 'N/A' }],
    });

    expect(dataset.columns).toEqual([{ key: 'code', label: 'code', type: 'string' }]);
    expect(dataset.rows).toEqual([{ code: '007' }, { code: 'N/A' }]);
  });

  it('handles empty string values in an otherwise numeric column', () => {
    const dataset = buildDataset({
      headers: ['score'],
      rows: [{ score: '10' }, { score: '' }],
    });

    expect(dataset.columns).toEqual([{ key: 'score', label: 'score', type: 'number' }]);
    expect(dataset.rows).toEqual([{ score: 10 }, { score: '' }]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/utils/buildDataset.test.ts`
Expected: FAIL — `buildDataset` is not defined / module not found.

- [ ] **Step 3: Implement `buildDataset`**

Create `src/utils/buildDataset.ts`:

```ts
import type { ColumnDef, Dataset, RawTable, Row } from '../types/dataset';

function isNumeric(value: string | number): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  if (value.trim() === '') return false;
  return Number.isFinite(Number(value));
}

export function buildDataset(raw: RawTable): Dataset {
  const columns: ColumnDef[] = raw.headers.map((key) => {
    const values = raw.rows
      .map((row) => row[key])
      .filter((value) => value !== '' && value !== undefined);
    const allNumeric = values.length > 0 && values.every(isNumeric);
    return { key, label: key, type: allNumeric ? 'number' : 'string' };
  });

  const rows: Row[] = raw.rows.map((rawRow) => {
    const row: Row = {};
    for (const column of columns) {
      const value = rawRow[column.key];
      row[column.key] =
        column.type === 'number' && value !== '' && value !== undefined
          ? Number(value)
          : (value ?? '');
    }
    return row;
  });

  return { columns, rows };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/utils/buildDataset.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Add the bundled sample dataset**

Create `src/assets/sample-data.csv` with generic, realistic-looking sample data (no real people/companies):

```csv
month,region,units_sold,revenue
January,North,120,3600
January,South,95,2850
February,North,140,4200
February,South,110,3300
March,North,160,4800
March,South,130,3900
April,North,175,5250
April,South,150,4500
May,North,190,5700
May,South,165,4950
```

- [ ] **Step 6: Declare the `?raw` module type for CSV imports**

Create `src/vite-env.d.ts` (or append if `create-vite` already generated one with `/// <reference types="vite/client" />` — keep that line and add the block below):

```ts
/// <reference types="vite/client" />

declare module '*.csv?raw' {
  const content: string;
  export default content;
}
```

- [ ] **Step 7: Commit**

```bash
git add src/utils/buildDataset.ts src/utils/buildDataset.test.ts src/assets/sample-data.csv src/vite-env.d.ts
git commit -m "Add dataset construction from parsed rows and bundle a sample dataset"
```

---

### Task 5: Stats and dataset-summary utilities

**Files:**
- Create: `src/utils/stats.ts`
- Create: `src/utils/stats.test.ts`
- Create: `src/utils/buildDatasetSummary.ts`
- Create: `src/utils/buildDatasetSummary.test.ts`

**Interfaces:**
- Consumes: `Dataset`, `ColumnStats` from `src/types/dataset.ts`; `DatasetSummary` from `src/types/ai.ts`.
- Produces: `computeColumnStats(dataset: Dataset, columnKey: string): ColumnStats`, `getNumericColumnKeys(dataset: Dataset): string[]` (used by `ChartPanel` in Task 11), and `buildDatasetSummary(dataset: Dataset): DatasetSummary` (used by `AskAboutData` in Task 13).

- [ ] **Step 1: Write the failing tests for `stats.ts`**

Create `src/utils/stats.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { computeColumnStats, getNumericColumnKeys } from './stats';
import type { Dataset } from '../types/dataset';

const dataset: Dataset = {
  columns: [
    { key: 'name', label: 'name', type: 'string' },
    { key: 'score', label: 'score', type: 'number' },
  ],
  rows: [
    { name: 'Ada', score: 10 },
    { name: 'Grace', score: 20 },
    { name: 'Alan', score: 30 },
  ],
};

describe('computeColumnStats', () => {
  it('computes count, min, max, avg, and sum for a numeric column', () => {
    expect(computeColumnStats(dataset, 'score')).toEqual({
      key: 'score',
      count: 3,
      min: 10,
      max: 30,
      avg: 20,
      sum: 60,
    });
  });

  it('returns zeroed stats when the column has no numeric values', () => {
    expect(computeColumnStats(dataset, 'name')).toEqual({
      key: 'name',
      count: 0,
      min: 0,
      max: 0,
      avg: 0,
      sum: 0,
    });
  });
});

describe('getNumericColumnKeys', () => {
  it('returns only the keys of number-typed columns', () => {
    expect(getNumericColumnKeys(dataset)).toEqual(['score']);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/utils/stats.test.ts`
Expected: FAIL — `computeColumnStats`/`getNumericColumnKeys` not defined.

- [ ] **Step 3: Implement `stats.ts`**

Create `src/utils/stats.ts`:

```ts
import type { ColumnStats, Dataset } from '../types/dataset';

export function computeColumnStats(dataset: Dataset, columnKey: string): ColumnStats {
  const values = dataset.rows
    .map((row) => row[columnKey])
    .filter((value): value is number => typeof value === 'number');

  if (values.length === 0) {
    return { key: columnKey, count: 0, min: 0, max: 0, avg: 0, sum: 0 };
  }

  const sum = values.reduce((total, value) => total + value, 0);
  return {
    key: columnKey,
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    avg: sum / values.length,
    sum,
  };
}

export function getNumericColumnKeys(dataset: Dataset): string[] {
  return dataset.columns.filter((column) => column.type === 'number').map((column) => column.key);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/utils/stats.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing tests for `buildDatasetSummary`**

Create `src/utils/buildDatasetSummary.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildDatasetSummary } from './buildDatasetSummary';
import type { Dataset } from '../types/dataset';

describe('buildDatasetSummary', () => {
  it('summarizes row count, columns, numeric stats, and a capped row sample', () => {
    const dataset: Dataset = {
      columns: [
        { key: 'name', label: 'name', type: 'string' },
        { key: 'score', label: 'score', type: 'number' },
      ],
      rows: Array.from({ length: 8 }, (_, i) => ({ name: `Person ${i}`, score: i * 10 })),
    };

    const summary = buildDatasetSummary(dataset);

    expect(summary.rowCount).toBe(8);
    expect(summary.columns).toEqual([
      { key: 'name', label: 'name', type: 'string' },
      { key: 'score', label: 'score', type: 'number' },
    ]);
    expect(summary.numericStats).toEqual([
      { key: 'score', count: 8, min: 0, max: 70, avg: 35, sum: 280 },
    ]);
    expect(summary.sampleRows).toHaveLength(5);
    expect(summary.sampleRows[0]).toEqual({ name: 'Person 0', score: 0 });
  });
});
```

- [ ] **Step 6: Run the tests to verify they fail**

Run: `npx vitest run src/utils/buildDatasetSummary.test.ts`
Expected: FAIL — `buildDatasetSummary` is not defined.

- [ ] **Step 7: Implement `buildDatasetSummary`**

Create `src/utils/buildDatasetSummary.ts`:

```ts
import type { Dataset } from '../types/dataset';
import type { DatasetSummary } from '../types/ai';
import { computeColumnStats, getNumericColumnKeys } from './stats';

const SAMPLE_ROW_COUNT = 5;

export function buildDatasetSummary(dataset: Dataset): DatasetSummary {
  const numericStats = getNumericColumnKeys(dataset).map((key) => computeColumnStats(dataset, key));

  return {
    rowCount: dataset.rows.length,
    columns: dataset.columns.map(({ key, label, type }) => ({ key, label, type })),
    numericStats,
    sampleRows: dataset.rows.slice(0, SAMPLE_ROW_COUNT),
  };
}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npx vitest run src/utils/buildDatasetSummary.test.ts`
Expected: PASS (1 test).

- [ ] **Step 9: Commit**

```bash
git add src/utils/stats.ts src/utils/stats.test.ts src/utils/buildDatasetSummary.ts src/utils/buildDatasetSummary.test.ts
git commit -m "Add column stats and dataset summary utilities"
```

---

### Task 6: `useSort` hook

**Files:**
- Create: `src/hooks/useSort.ts`
- Create: `src/hooks/useSort.test.ts`

**Interfaces:**
- Consumes: `Row`, `SortDirection` from `src/types/dataset.ts`.
- Produces: `useSort(rows: Row[]): { sortedRows: Row[]; sortColumn: string | null; sortDirection: SortDirection; toggleSort: (column: string) => void }`, used by `DataTable` in Task 10.

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useSort.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSort } from './useSort';
import type { Row } from '../types/dataset';

const rows: Row[] = [
  { name: 'Grace', score: 20 },
  { name: 'Ada', score: 30 },
  { name: 'Alan', score: 10 },
];

describe('useSort', () => {
  it('returns rows unsorted by default', () => {
    const { result } = renderHook(() => useSort(rows));
    expect(result.current.sortedRows).toEqual(rows);
    expect(result.current.sortColumn).toBeNull();
    expect(result.current.sortDirection).toBeNull();
  });

  it('cycles a column through asc, desc, then unsorted', () => {
    const { result } = renderHook(() => useSort(rows));

    act(() => result.current.toggleSort('score'));
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.sortedRows.map((r) => r.score)).toEqual([10, 20, 30]);

    act(() => result.current.toggleSort('score'));
    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.sortedRows.map((r) => r.score)).toEqual([30, 20, 10]);

    act(() => result.current.toggleSort('score'));
    expect(result.current.sortDirection).toBeNull();
    expect(result.current.sortColumn).toBeNull();
    expect(result.current.sortedRows).toEqual(rows);
  });

  it('sorts string columns alphabetically', () => {
    const { result } = renderHook(() => useSort(rows));
    act(() => result.current.toggleSort('name'));
    expect(result.current.sortedRows.map((r) => r.name)).toEqual(['Ada', 'Alan', 'Grace']);
  });

  it('switching to a new column resets to ascending', () => {
    const { result } = renderHook(() => useSort(rows));
    act(() => result.current.toggleSort('score'));
    act(() => result.current.toggleSort('score'));
    act(() => result.current.toggleSort('name'));
    expect(result.current.sortColumn).toBe('name');
    expect(result.current.sortDirection).toBe('asc');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/hooks/useSort.test.ts`
Expected: FAIL — `useSort` is not defined.

- [ ] **Step 3: Implement `useSort`**

Create `src/hooks/useSort.ts`:

```ts
import { useMemo, useState } from 'react';
import type { Row, SortDirection } from '../types/dataset';

export interface UseSortResult {
  sortedRows: Row[];
  sortColumn: string | null;
  sortDirection: SortDirection;
  toggleSort: (column: string) => void;
}

export function useSort(rows: Row[]): UseSortResult {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const toggleSort = (column: string) => {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortDirection('asc');
      return;
    }
    if (sortDirection === 'asc') {
      setSortDirection('desc');
      return;
    }
    setSortColumn(null);
    setSortDirection(null);
  };

  const sortedRows = useMemo(() => {
    if (!sortColumn || !sortDirection) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortColumn, sortDirection]);

  return { sortedRows, sortColumn, sortDirection, toggleSort };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/hooks/useSort.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSort.ts src/hooks/useSort.test.ts
git commit -m "Add useSort hook with asc/desc/unsorted cycling"
```

---

### Task 7: `useFilter` hook

**Files:**
- Create: `src/hooks/useFilter.ts`
- Create: `src/hooks/useFilter.test.ts`

**Interfaces:**
- Consumes: `Row` from `src/types/dataset.ts`.
- Produces: `useFilter(rows: Row[]): { filteredRows: Row[]; filterText: string; setFilterText: (text: string) => void }`, used by `DataTable` in Task 10.

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useFilter.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFilter } from './useFilter';
import type { Row } from '../types/dataset';

const rows: Row[] = [
  { name: 'Ada Lovelace', score: 30 },
  { name: 'Grace Hopper', score: 20 },
  { name: 'Alan Turing', score: 10 },
];

describe('useFilter', () => {
  it('returns all rows when the filter text is empty', () => {
    const { result } = renderHook(() => useFilter(rows));
    expect(result.current.filteredRows).toEqual(rows);
  });

  it('filters rows by a case-insensitive substring match across all columns', () => {
    const { result } = renderHook(() => useFilter(rows));
    act(() => result.current.setFilterText('grace'));
    expect(result.current.filteredRows).toEqual([{ name: 'Grace Hopper', score: 20 }]);
  });

  it('matches against numeric column values too', () => {
    const { result } = renderHook(() => useFilter(rows));
    act(() => result.current.setFilterText('30'));
    expect(result.current.filteredRows).toEqual([{ name: 'Ada Lovelace', score: 30 }]);
  });

  it('returns an empty array when nothing matches', () => {
    const { result } = renderHook(() => useFilter(rows));
    act(() => result.current.setFilterText('nonexistent'));
    expect(result.current.filteredRows).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/hooks/useFilter.test.ts`
Expected: FAIL — `useFilter` is not defined.

- [ ] **Step 3: Implement `useFilter`**

Create `src/hooks/useFilter.ts`:

```ts
import { useMemo, useState } from 'react';
import type { Row } from '../types/dataset';

export interface UseFilterResult {
  filteredRows: Row[];
  filterText: string;
  setFilterText: (text: string) => void;
}

export function useFilter(rows: Row[]): UseFilterResult {
  const [filterText, setFilterText] = useState('');

  const filteredRows = useMemo(() => {
    const query = filterText.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(query))
    );
  }, [rows, filterText]);

  return { filteredRows, filterText, setFilterText };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/hooks/useFilter.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useFilter.ts src/hooks/useFilter.test.ts
git commit -m "Add useFilter hook for case-insensitive row filtering"
```

---

### Task 8: `useDataset` hook

**Files:**
- Create: `src/hooks/useDataset.ts`
- Create: `src/hooks/useDataset.test.ts`

**Interfaces:**
- Consumes: `Dataset` from `src/types/dataset.ts`; `parseCsv` from `src/utils/parseCsv.ts`; `parseJson` from `src/utils/parseJson.ts`; `buildDataset` from `src/utils/buildDataset.ts`; the raw sample CSV text via `import sampleCsv from '../assets/sample-data.csv?raw'`.
- Produces: `useDataset(): { dataset: Dataset | null; error: string | null; isLoading: boolean; loadFromFile: (file: File) => Promise<void>; loadSample: () => void; clear: () => void }`, used by `Home` in Task 14.

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useDataset.test.ts`:

```ts
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { useDataset } from './useDataset';

function makeFile(content: string, name: string): File {
  return new File([content], name, { type: 'text/plain' });
}

describe('useDataset', () => {
  it('starts with no dataset loaded', () => {
    const { result } = renderHook(() => useDataset());
    expect(result.current.dataset).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('loads a dataset from an uploaded CSV file', async () => {
    const { result } = renderHook(() => useDataset());
    const file = makeFile('name,age\nAda,30', 'people.csv');

    await act(async () => {
      await result.current.loadFromFile(file);
    });

    await waitFor(() => expect(result.current.dataset).not.toBeNull());
    expect(result.current.dataset?.rows).toEqual([{ name: 'Ada', age: 30 }]);
    expect(result.current.error).toBeNull();
  });

  it('loads a dataset from an uploaded JSON file', async () => {
    const { result } = renderHook(() => useDataset());
    const file = makeFile(JSON.stringify([{ name: 'Ada', age: 30 }]), 'people.json');

    await act(async () => {
      await result.current.loadFromFile(file);
    });

    await waitFor(() => expect(result.current.dataset).not.toBeNull());
    expect(result.current.dataset?.rows).toEqual([{ name: 'Ada', age: 30 }]);
  });

  it('sets an error and clears the dataset on invalid input', async () => {
    const { result } = renderHook(() => useDataset());
    const file = makeFile('{not valid', 'bad.json');

    await act(async () => {
      await result.current.loadFromFile(file);
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.dataset).toBeNull();
  });

  it('loads the bundled sample dataset', () => {
    const { result } = renderHook(() => useDataset());
    act(() => result.current.loadSample());
    expect(result.current.dataset).not.toBeNull();
    expect(result.current.dataset?.rows.length).toBeGreaterThan(0);
  });

  it('clear resets the dataset and error', () => {
    const { result } = renderHook(() => useDataset());
    act(() => result.current.loadSample());
    act(() => result.current.clear());
    expect(result.current.dataset).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/hooks/useDataset.test.ts`
Expected: FAIL — `useDataset` is not defined.

- [ ] **Step 3: Implement `useDataset`**

Create `src/hooks/useDataset.ts`:

```ts
import { useState } from 'react';
import { buildDataset } from '../utils/buildDataset';
import { parseCsv } from '../utils/parseCsv';
import { parseJson } from '../utils/parseJson';
import type { Dataset } from '../types/dataset';
import sampleCsv from '../assets/sample-data.csv?raw';

export interface UseDatasetResult {
  dataset: Dataset | null;
  error: string | null;
  isLoading: boolean;
  loadFromFile: (file: File) => Promise<void>;
  loadSample: () => void;
  clear: () => void;
}

function parseText(text: string, fileName: string): Dataset {
  const isJson = fileName.toLowerCase().endsWith('.json');
  const raw = isJson ? parseJson(text) : parseCsv(text);
  return buildDataset(raw);
}

export function useDataset(): UseDatasetResult {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadFromFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const text = await file.text();
      setDataset(parseText(text, file.name));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file.');
      setDataset(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = () => {
    setError(null);
    try {
      setDataset(parseText(sampleCsv, 'sample-data.csv'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sample data.');
    }
  };

  const clear = () => {
    setDataset(null);
    setError(null);
  };

  return { dataset, error, isLoading, loadFromFile, loadSample, clear };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/hooks/useDataset.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useDataset.ts src/hooks/useDataset.test.ts
git commit -m "Add useDataset hook wiring parsing, sample data, and error state"
```

---

### Task 9: `FileUpload` component

**Files:**
- Create: `src/components/FileUpload/FileUpload.tsx`
- Create: `src/components/FileUpload/FileUpload.test.tsx`

**Interfaces:**
- Produces: `FileUpload` component with props `{ onFileSelected: (file: File) => void; onLoadSample: () => void; isLoading: boolean; error: string | null }`, wired to `useDataset` by `Home` in Task 14. Purely presentational — takes no dependency on `useDataset` directly, which keeps it testable with plain mock callbacks.

- [ ] **Step 1: Write the failing tests**

Create `src/components/FileUpload/FileUpload.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FileUpload } from './FileUpload';

describe('FileUpload', () => {
  it('calls onFileSelected with the chosen file', async () => {
    const onFileSelected = vi.fn();
    render(
      <FileUpload onFileSelected={onFileSelected} onLoadSample={vi.fn()} isLoading={false} error={null} />
    );

    const file = new File(['name,age\nAda,30'], 'people.csv', { type: 'text/csv' });
    const input = screen.getByTestId('file-upload-input');
    await userEvent.upload(input, file);

    expect(onFileSelected).toHaveBeenCalledWith(file);
  });

  it('calls onLoadSample when the sample data button is clicked', async () => {
    const onLoadSample = vi.fn();
    render(
      <FileUpload onFileSelected={vi.fn()} onLoadSample={onLoadSample} isLoading={false} error={null} />
    );

    await userEvent.click(screen.getByText('Load sample data'));
    expect(onLoadSample).toHaveBeenCalledOnce();
  });

  it('disables both buttons while loading', () => {
    render(<FileUpload onFileSelected={vi.fn()} onLoadSample={vi.fn()} isLoading error={null} />);
    expect(screen.getByText('Upload CSV or JSON').closest('button')).toBeDisabled();
    expect(screen.getByText('Load sample data').closest('button')).toBeDisabled();
  });

  it('renders an error message when provided', () => {
    render(
      <FileUpload onFileSelected={vi.fn()} onLoadSample={vi.fn()} isLoading={false} error="Bad file." />
    );
    expect(screen.getByText('Bad file.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/FileUpload/FileUpload.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `FileUpload`**

Create `src/components/FileUpload/FileUpload.tsx`:

```tsx
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/FileUpload/FileUpload.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/FileUpload
git commit -m "Add FileUpload component"
```

---

### Task 10: `DataTable` component

**Files:**
- Create: `src/components/DataTable/DataTable.tsx`
- Create: `src/components/DataTable/DataTable.test.tsx`

**Interfaces:**
- Consumes: `useSort` from `src/hooks/useSort.ts`, `useFilter` from `src/hooks/useFilter.ts`, `ColumnDef`/`Row` from `src/types/dataset.ts`.
- Produces: `DataTable` component with props `{ columns: ColumnDef[]; rows: Row[] }`, used by `Home` in Task 14.

- [ ] **Step 1: Write the failing tests**

Create `src/components/DataTable/DataTable.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { DataTable } from './DataTable';
import type { ColumnDef, Row } from '../../types/dataset';

const columns: ColumnDef[] = [
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'score', label: 'Score', type: 'number' },
];

const rows: Row[] = [
  { name: 'Grace', score: 20 },
  { name: 'Ada', score: 30 },
  { name: 'Alan', score: 10 },
];

describe('DataTable', () => {
  it('renders column headers and all rows', () => {
    render(<DataTable columns={columns} rows={rows} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4); // header + 3 rows
  });

  it('sorts rows ascending when a column header is clicked', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} />);
    fireEvent.click(screen.getByText('Score'));

    const dataRows = container.querySelectorAll('tbody tr');
    expect(dataRows[0]).toHaveTextContent('Alan');
    expect(dataRows[1]).toHaveTextContent('Grace');
    expect(dataRows[2]).toHaveTextContent('Ada');
  });

  it('filters rows via the search box', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} />);
    const searchbar = container.querySelector('ion-searchbar')!;
    fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'grace' } }));

    const dataRows = container.querySelectorAll('tbody tr');
    expect(dataRows).toHaveLength(1);
    expect(dataRows[0]).toHaveTextContent('Grace');
  });

  it('shows an empty state when no rows match the filter', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} />);
    const searchbar = container.querySelector('ion-searchbar')!;
    fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'nonexistent' } }));

    expect(screen.getByText('No rows match your filter.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/DataTable/DataTable.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `DataTable`**

Create `src/components/DataTable/DataTable.tsx`:

```tsx
import { IonIcon, IonSearchbar } from '@ionic/react';
import { caretDown, caretUp, swapVertical } from 'ionicons/icons';
import { useFilter } from '../../hooks/useFilter';
import { useSort } from '../../hooks/useSort';
import type { ColumnDef, Row } from '../../types/dataset';

export interface DataTableProps {
  columns: ColumnDef[];
  rows: Row[];
}

export function DataTable({ columns, rows }: DataTableProps) {
  const { filteredRows, filterText, setFilterText } = useFilter(rows);
  const { sortedRows, sortColumn, sortDirection, toggleSort } = useSort(filteredRows);

  const sortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return swapVertical;
    return sortDirection === 'asc' ? caretUp : caretDown;
  };

  return (
    <div>
      <IonSearchbar
        value={filterText}
        onIonInput={(e) => setFilterText(e.detail.value ?? '')}
        placeholder="Filter rows"
      />
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} onClick={() => toggleSort(column.key)} style={{ cursor: 'pointer' }}>
                {column.label}
                <IonIcon icon={sortIcon(column.key)} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>{row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {sortedRows.length === 0 && <p>No rows match your filter.</p>}
    </div>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/DataTable/DataTable.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/DataTable
git commit -m "Add DataTable component composing useSort and useFilter"
```

---

### Task 11: `ChartPanel` component

**Files:**
- Create: `src/components/ChartPanel/ChartPanel.tsx`

**Interfaces:**
- Consumes: `getNumericColumnKeys` from `src/utils/stats.ts`, `Dataset` from `src/types/dataset.ts`, `recharts`.
- Produces: `ChartPanel` component with props `{ dataset: Dataset }`, used by `Home` in Task 14.

No automated test for this task per the spec's testing scope (chart rendering is verified manually in Task 14's dev-server check) — `recharts`' `ResponsiveContainer` reports zero width/height under `jsdom` since it has no real layout engine, so an RTL test here would be testing a false positive, not real behavior.

- [ ] **Step 1: Implement `ChartPanel`**

Create `src/components/ChartPanel/ChartPanel.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ChartPanel
git commit -m "Add ChartPanel component with bar/line toggle via recharts"
```

---

### Task 12: Claude API client

**Files:**
- Create: `src/components/AskAboutData/claudeClient.ts`
- Create: `src/components/AskAboutData/claudeClient.test.ts`

**Interfaces:**
- Consumes: `ClaudeModel`, `DatasetSummary` from `src/types/ai.ts`.
- Produces: `askClaude(params: { apiKey: string; model: ClaudeModel; question: string; summary: DatasetSummary }): Promise<string>`, used by `AskAboutData` in Task 13.

- [ ] **Step 1: Write the failing tests**

Create `src/components/AskAboutData/claudeClient.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { askClaude } from './claudeClient';
import type { DatasetSummary } from '../../types/ai';

const summary: DatasetSummary = {
  rowCount: 1,
  columns: [{ key: 'score', label: 'score', type: 'number' }],
  numericStats: [{ key: 'score', count: 1, min: 1, max: 1, avg: 1, sum: 1 }],
  sampleRows: [{ score: 1 }],
};

describe('askClaude', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends the expected request and returns the response text', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ text: 'The score trends upward.' }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const answer = await askClaude({
      apiKey: 'test-key',
      model: 'claude-sonnet-5',
      question: 'What is the trend?',
      summary,
    });

    expect(answer).toBe('The score trends upward.');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect(options.headers['x-api-key']).toBe('test-key');
    expect(options.headers['anthropic-dangerous-direct-browser-access']).toBe('true');
    const body = JSON.parse(options.body);
    expect(body.model).toBe('claude-sonnet-5');
    expect(body.messages[0].content).toContain('What is the trend?');
  });

  it('throws a descriptive error when the API responds with an error status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'invalid x-api-key',
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      askClaude({ apiKey: 'bad-key', model: 'claude-sonnet-5', question: 'Why?', summary })
    ).rejects.toThrow('Claude API error (401): invalid x-api-key');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/AskAboutData/claudeClient.test.ts`
Expected: FAIL — `askClaude` is not defined.

- [ ] **Step 3: Implement `claudeClient`**

Create `src/components/AskAboutData/claudeClient.ts`:

```ts
import type { ClaudeModel, DatasetSummary } from '../../types/ai';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export interface AskClaudeParams {
  apiKey: string;
  model: ClaudeModel;
  question: string;
  summary: DatasetSummary;
}

function buildPrompt(question: string, summary: DatasetSummary): string {
  return [
    'You are analyzing a dataset for a user. Here is a summary of the dataset:',
    JSON.stringify(summary, null, 2),
    '',
    `Question: ${question}`,
  ].join('\n');
}

export async function askClaude({ apiKey, model, question, summary }: AskClaudeParams): Promise<string> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildPrompt(question, summary) }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Claude API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (typeof text !== 'string') {
    throw new Error('Unexpected response shape from Claude API.');
  }
  return text;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/AskAboutData/claudeClient.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/AskAboutData/claudeClient.ts src/components/AskAboutData/claudeClient.test.ts
git commit -m "Add Claude API client for the Ask About Data feature"
```

---

### Task 13: `AskAboutData` component

**Files:**
- Create: `src/components/AskAboutData/AskAboutData.tsx`
- Create: `src/components/AskAboutData/AskAboutData.test.tsx`

**Interfaces:**
- Consumes: `askClaude` from `./claudeClient`, `buildDatasetSummary` from `src/utils/buildDatasetSummary.ts`, `ClaudeModel` from `src/types/ai.ts`, `Dataset` from `src/types/dataset.ts`.
- Produces: `AskAboutData` component with props `{ dataset: Dataset }`, used by `Home` in Task 14.

- [ ] **Step 1: Write the failing tests**

Create `src/components/AskAboutData/AskAboutData.test.tsx`:

```tsx
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
    expect(screen.getByTestId('ask-button')).toBeDisabled();
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/AskAboutData/AskAboutData.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `AskAboutData`**

Create `src/components/AskAboutData/AskAboutData.tsx`:

```tsx
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/AskAboutData/AskAboutData.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/AskAboutData/AskAboutData.tsx src/components/AskAboutData/AskAboutData.test.tsx
git commit -m "Add AskAboutData component"
```

---

### Task 14: Wire everything together in `Home`

**Files:**
- Modify: `src/pages/Home.tsx` (replace the Task 1 placeholder with the full composition)
- Modify: `src/App.test.tsx` (update the assertion now that `Home` renders more than just the title)

**Interfaces:**
- Consumes: `useDataset` from `src/hooks/useDataset.ts`; `FileUpload`, `DataTable`, `ChartPanel`, `AskAboutData` from their respective component directories.

- [ ] **Step 1: Replace `src/pages/Home.tsx`**

```tsx
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
```

- [ ] **Step 2: Update the App smoke test to also cover the sample-data flow**

Replace `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the Insight Dash title', () => {
    render(<App />);
    expect(screen.getByText('Insight Dash')).toBeInTheDocument();
  });

  it('shows the data table and chart after loading the sample dataset', async () => {
    render(<App />);
    await userEvent.click(screen.getByText('Load sample data'));
    expect(await screen.findByText('month')).toBeInTheDocument();
    expect(screen.getByText('Clear dataset')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: all test files PASS.

- [ ] **Step 4: Manually verify in the browser**

Run: `npm run dev`, open the printed local URL, click "Load sample data", confirm the table renders and is sortable/filterable, the chart renders with visible bars, and the "Ask about your data" panel renders its inputs (an actual Claude call isn't required for this check — just confirm the panel and its disabled/enabled button state work). Stop the dev server when done.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Home.tsx src/App.test.tsx
git commit -m "Compose FileUpload, DataTable, ChartPanel, and AskAboutData in Home"
```

---

### Task 15: Capacitor Android setup

**Files:**
- Create: `capacitor.config.ts` (generated by `cap init`)
- Create: `android/` (generated by `cap add android`)

**Interfaces:**
- None consumed from app code — this task only wires the existing `dist/` web build into a native Android shell.

- [ ] **Step 1: Build the web app**

Run: `npm run build`
Expected: `dist/` is produced with no errors (Capacitor needs a build output to sync).

- [ ] **Step 2: Initialize Capacitor**

Run:
```bash
npx cap init insight-dash com.abhaynaveen.insightdash --web-dir=dist
```
Expected: `capacitor.config.ts` is created at the project root with `appId: 'com.abhaynaveen.insightdash'`, `appName: 'insight-dash'`, `webDir: 'dist'`.

- [ ] **Step 3: Add the Android platform**

Run: `npx cap add android`
Expected: an `android/` directory is created containing the native Gradle project.

If this step fails or hangs in a sandboxed/offline environment (it needs to download Gradle and Android tooling), stop here, note it in the commit message as best-effort, and leave `android/` out rather than committing a broken half-generated platform — the web app is already complete and independently reviewable without it.

- [ ] **Step 4: Sync the web build into the Android project**

Run: `npx cap sync android`
Expected: completes with no errors, copying `dist/` into `android/app/src/main/assets/public`.

- [ ] **Step 5: Commit**

```bash
git add capacitor.config.ts android
git commit -m "Add Capacitor Android platform"
```

---

### Task 16: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# Insight Dash

A small, standalone data dashboard: upload a CSV or JSON file, explore it in
a sortable and filterable table, chart a numeric column, and optionally ask
a question about the dataset using the Claude API. Everything runs
client-side — there is no backend.

## Features

- **File upload** — CSV or JSON, parsed entirely in the browser.
- **Data table** — click a column header to sort, use the search box to
  filter across all columns.
- **Chart** — pick a numeric column and toggle between a bar or line chart.
- **Ask about your data (optional)** — paste your own Claude API key at
  runtime and ask a question about the loaded dataset. The key is kept only
  in memory for the session; it is never stored or hardcoded.

## Tech stack

- [Vite](https://vitejs.dev/) + React + TypeScript
- [Ionic React](https://ionicframework.com/docs/react) + Ionic React Router
- [Capacitor](https://capacitorjs.com/) (Android)
- [Papa Parse](https://www.papaparse.com/) for CSV parsing
- [Recharts](https://recharts.org/) for charting
- [Vitest](https://vitest.dev/) + React Testing Library for tests

## Running locally

```bash
npm install
npm run dev
```

Open the printed local URL, then click **Load sample data** to try the app
immediately, or upload your own `.csv` or `.json` file.

## Running tests

```bash
npm test
```

## Building for the web

```bash
npm run build
```

Outputs a static bundle to `dist/`, deployable to any static host.

## Building an Android debug APK

This project is Capacitor-ready. To build a debug APK:

```bash
npm run build
npx cap sync android
```

Then either:

- Open the `android/` folder in Android Studio and use **Build > Build APK**, or
- Run `cd android && ./gradlew assembleDebug` and find the APK under
  `android/app/build/outputs/apk/debug/`.

## Using the "Ask about your data" panel

This feature calls the Claude API directly from the browser, so it needs
your own API key (from [console.anthropic.com](https://console.anthropic.com)) pasted into
the password field at runtime. That key is:

- **Never** hardcoded or committed to this repository.
- **Never** persisted to storage — it lives only in component state for the
  current session and is gone on page reload.
- Sent directly from your browser to Anthropic's API using the
  `anthropic-dangerous-direct-browser-access` header, which means it is
  visible in your browser's network requests. That's an acceptable
  tradeoff for a local, single-user tool like this one, but it is **not**
  a pattern to use for a real multi-user product — a production app would
  proxy this call through a backend that holds the key server-side.

## Development approach

This project was built spec-first: a short design document was written and
reviewed before any code, then implemented test-first (a failing test
before each piece of implementation) in small, independently-committed
steps, using AI pair-programming tools throughout for both planning and
implementation. The AI-assisted parts of the workflow — spec review, test
generation, boilerplate — are treated the same way any other tool output
would be: read, checked, and adjusted before being committed, with the
deterministic pieces (parsing correctness, type safety, test coverage)
held to the same bar as if written by hand.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Add README with setup, testing, Android build, and AI-assisted workflow notes"
```

---

## Self-Review Notes

- **Spec coverage:** File upload (Task 9), sortable/filterable table (Tasks 6, 7, 10), chart (Task 11), optional AI insight box with runtime-only password-input API key (Tasks 12, 13), `src/components`/`src/hooks`/`src/types`/`src/utils` folder structure (all tasks), parsing/sort/filter/DataTable/FileUpload test coverage (Tasks 3, 4, 6, 7, 9, 10), README with overview/stack/run/build/Android/AI-workflow note (Task 16), Capacitor Android setup (Task 15). No spec section is without a task.
- **Placeholder scan:** no TBD/TODO markers; every step has runnable commands or complete code.
- **Type consistency:** `Dataset`, `ColumnDef`, `Row`, `SortDirection`, `RawTable`, `ColumnStats` (Task 2) are used identically by name in every later task; `DatasetSummary`/`ClaudeModel` (Task 2) flow unchanged from `buildDatasetSummary` (Task 5) through `claudeClient` (Task 12) into `AskAboutData` (Task 13); hook return shapes (`UseSortResult`, `UseFilterResult`, `UseDatasetResult`) match how `DataTable` (Task 10) and `Home` (Task 14) consume them.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-17-insight-dash-implementation.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
