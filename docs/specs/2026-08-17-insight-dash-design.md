# Insight Dash — Design Spec

## Overview

Insight Dash is a small, standalone client-side data dashboard: upload a CSV
or JSON file, view it in a sortable/filterable table, see a quick chart of a
numeric column, and optionally ask a question about the dataset via the
Claude API. Built with Ionic + React + TypeScript + Capacitor so it runs as a
web app and is ready to package as an Android debug APK. No backend — all
parsing and computation happens client-side; the only network call is the
optional direct-from-browser request to the Claude API.

## Goals

- Clean, componentized, typed React/TypeScript code that reads well on its
  own — a reviewer should be able to open the repo and follow the structure
  without guidance.
- A working, testable core (upload → table → chart) that doesn't depend on
  any external service.
- One well-scoped optional AI feature (`AskAboutData`) that demonstrates a
  real product integration with an LLM, including its main tradeoff
  (client-side API key exposure) handled honestly rather than hidden.
- Runnable in a browser in a couple of minutes; Capacitor/Android setup
  present and documented but not required to evaluate the app.

## Non-goals

- No backend/server component of any kind.
- No persistence (no localStorage/IndexedDB) — a fresh page load starts
  clean; the API key is never stored.
- No multi-page navigation/routing complexity — a single screen is enough
  for this tool.
- No auth, no multi-user concerns.

## Tech stack

- Vite + React + TypeScript
- `@ionic/react`, `@ionic/react-router`, `ionicons`, `react-router-dom`
- `@capacitor/core`, `@capacitor/android`, `@capacitor/cli` (dev dep)
- `papaparse` (+ `@types/papaparse`) for CSV parsing
- `recharts` for the chart
- `vitest`, `@testing-library/react`, `@testing-library/jest-dom`,
  `@testing-library/user-event`, `jsdom`

## Architecture & data flow

Single route (`/`) rendered via `IonReactRouter`, matching the standard
Ionic app shape without adding navigation the app doesn't need.

```
Home (page)
 ├─ FileUpload           (drives useDataset.loadFromFile / loadSample)
 ├─ DataTable             (uses useSort + useFilter over dataset.rows)
 ├─ ChartPanel            (reads dataset directly, picks a numeric column)
 └─ AskAboutData          (reads dataset directly, builds summary + calls API)
```

`useDataset` is the single owner of the loaded `Dataset` (columns + typed
rows, inferred types). Everything downstream — table, chart, AI summary —
reads from that one piece of state. `useSort` and `useFilter` are generic,
independently testable hooks that operate on a row array and don't know
about `Dataset` specifically, so they're reusable and easy to unit test in
isolation.

## Types (`src/types/`)

- `Dataset`: `{ columns: ColumnDef[]; rows: Row[] }`
- `ColumnDef`: `{ key: string; label: string; type: 'string' | 'number' }`
- `Row`: `Record<string, string | number>`
- `SortDirection`: `'asc' | 'desc' | null`
- AI types: request/response shapes for the Claude call, and the small
  `DatasetSummary` shape sent to the model (see below).

## Parsing (`src/utils/`)

- CSV parsing uses `papaparse` rather than a hand-rolled splitter. A naive
  `split(',')` breaks on quoted fields and embedded commas/newlines;
  reaching for a small, well-tested library here is the deliberate
  "solid deterministic engineering, not reinvented" choice for this project.
- JSON parsing uses native `JSON.parse` plus validation that the result is
  an array of flat objects.
- A shared `inferColumnTypes(rows)` helper decides `'number'` vs `'string'`
  per column (numeric if every non-empty value parses as a finite number).
- `stats.ts` computes per-numeric-column stats (`count`, `min`, `max`, `avg`,
  `sum`) — used by both `ChartPanel` (implicitly, via recharts) and
  `AskAboutData` (explicitly, as part of the summary sent to the model).

## Components (`src/components/`)

- **FileUpload** — Ionic button opening a hidden `<input type="file">`
  (accepts `.csv`, `.json`), plus a "Load sample data" button that loads a
  bundled sample CSV (`public/sample-data.csv`, referenced generically —
  no company/brand data) so a reviewer can try the app with zero setup.
  Shows a parse error state (e.g. malformed file) via an `IonToast` or
  inline message.
- **DataTable** — plain `<table>` (Ionic has no native data-grid component)
  styled with Ionic CSS variables, `IonSearchbar` above it for text
  filtering across all columns, clickable `<th>` per column with a sort
  icon (ionicons `caret-up`/`caret-down`/`swap-vertical`) cycling
  asc → desc → unsorted.
- **ChartPanel** — `IonSelect` to choose which numeric column to chart,
  `IonSegment` to toggle bar vs. line, rendered with `recharts`
  (`BarChart`/`LineChart` + `ResponsiveContainer`). If no numeric column
  exists, shows a small empty state instead of an empty chart.
- **AskAboutData** — `IonInput type="password"` for the API key (component
  state only, cleared on unmount, never written to storage), `IonSelect`
  for model choice (`claude-sonnet-5` / `claude-haiku-4-5`), `IonTextarea`
  for the question, `IonButton` to submit (disabled until both key and
  question are present). Shows loading state while the request is in
  flight and the response (or a clear error) in an `IonCard` below.

## AI integration

- Endpoint: `POST https://api.anthropic.com/v1/messages`, called directly
  from the browser with headers `x-api-key`, `anthropic-version`, and
  `anthropic-dangerous-direct-browser-access: true`.
- Request body includes the chosen model, the user's question, and a
  compact `DatasetSummary` (column names/types, per-numeric-column stats,
  and a small capped sample of rows — not the full dataset), keeping the
  prompt small and avoiding sending more data than needed.
- The API key lives only in component state for the session; it is never
  logged, persisted, or included in any file that gets committed.
- **Documented tradeoff**: a direct-from-browser call means the key is
  visible in outgoing network requests. This is called out explicitly in
  the README as acceptable for a local/demo tool and explicitly not a
  pattern to use for a real multi-user product — this is intentional,
  since it's an honest example of a real engineering tradeoff rather than
  something to paper over.

## Testing (Vitest + RTL)

- `utils`: CSV parsing (including quoted/embedded-comma cases), JSON
  parsing (valid + malformed input), type inference, stats calculations.
- `hooks`: `useSort` (asc/desc/unsorted cycle, stability), `useFilter`
  (case-insensitive substring match across columns).
- `components`: `DataTable` renders headers/rows and re-sorts on header
  click; `FileUpload` invokes the parse/load path on file selection and on
  "Load sample data" click.
- `AskAboutData` gets a light smoke test with `fetch` mocked (renders,
  disabled/enabled button states, calls fetch with the expected shape) —
  no real network calls in the test suite.

## Build & Android

- `npm run dev` / `npm run build` for the web app — this is the primary way
  a reviewer evaluates the project.
- `npx cap init insight-dash com.abhaynaveen.insightdash` and
  `npx cap add android` set up the Capacitor Android project.
- README documents: `npm run build` → `npx cap sync android` → open in
  Android Studio (or `cd android && ./gradlew assembleDebug`) to produce a
  debug APK. Not required to evaluate the app in a browser.

## Delivery / repo presentation

- Git-initialized locally with incremental, readable commits as the app is
  built (scaffold → types/utils → hooks → components → tests → README →
  Capacitor/Android), so the commit history itself is legible.
- README: generic project overview, tech stack, run/build instructions,
  Android debug-APK steps, and a short, honest note on the AI-assisted
  development approach used to build the project (process-level — TDD,
  planning/spec-first workflow — not tool-branding).
- No company- or employer-specific references anywhere in code, comments,
  README, commit messages, or file names — this stays a standalone,
  reusable sample project.

## Open risks / things to watch during implementation

- `recharts` + Ionic layout inside `IonContent` sometimes needs an explicit
  height on the `ResponsiveContainer`'s parent — verify visually, not just
  via tests.
- Capacitor Android setup can be slow/flaky in sandboxed environments;
  treat `cap add android` as best-effort and don't let it block the core
  web app being complete and tested.
