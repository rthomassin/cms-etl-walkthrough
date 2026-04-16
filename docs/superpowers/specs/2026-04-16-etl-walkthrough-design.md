# CMS ETL Walkthrough — Workshop Demo

**Status:** Design approved 2026-04-16
**Owner:** Renaud Thomassin
**Type:** Design spec for implementation planning

---

## 1. Purpose

A web-based interactive walkthrough of the CMS (Cost Management System) ETL pipeline used by the GO Expansion finance team. Designed to be presented in workshop settings to **non-initiate audiences** — people who have never seen the process and need to understand what happens to a single labor data point as it travels from a regional office's payroll system to the final upload file.

**Why build this rather than slide through a static diagram:** the clever parts of the pipeline (like overtime redistribution across projects) only make sense when you *watch* them happen. A static flowchart can't show a row splitting into catchup pieces; a moving token can.

---

## 2. Audience & Usage Mode

- **Primary:** workshop presenter (Renaud) runs the app on a laptop/projector while narrating.
- **Secondary:** workshop attendees open the same URL on their own laptops and explore independently at their own pace — no sync with the presenter, no account, no login.
- **Desktop only.** Minimum viewport 1280px. No phone/tablet work in this version.
- **Plain-English everywhere.** No acronyms in node labels or tooltips without a glossary definition. Written for someone who has never heard of CMS, AFP, WBS, or CBS.

---

## 3. Architecture Overview

Single-page static React application. No backend, no auth, no persistence, no real-time sync. Everything is bundled at build time and served as static files from Cloudflare Pages.

```
Browser (desktop)
 └─ Static bundle from Cloudflare Pages (workshop.arbrass.ca)
     ├─ index.html (app shell)
     ├─ React + React Flow (diagram + interactions)
     ├─ Tailwind CSS (layout + brand theme)
     ├─ Zustand (tiny client-side state store)
     └─ Scenario data (TS modules, bundled at build time)
```

### Runtime model — scenario-driven simulation engine

- A **scenario** is a static data structure: an ordered list of **steps**.
- A **step** says: *"from node A, travel the edge to node B, take N ms, and on arrival show tooltip T."* Some steps also mutate the `laborRow` state (e.g. "Employee ID is now 012345").
- The engine reads steps one at a time. `play` auto-advances on a timer; `step`/`stepBack` move by one; `reset` returns to step 0 and clears state.
- The diagram (nodes + edges) is identical for both scenarios. Only the path the token takes and the commentary at each stop differ.

---

## 4. Components

### Component tree

```
<App>
├── <Header>
│   ├── <BrandLogo />              (Alstom wordmark / project name)
│   ├── <ScenarioToggle />         (two-tab switcher: Standard | Overtime)
│   └── <PlaybackControls />       (◀◀ ▶/⏸ ▶▶ ↻ + speed slider)
│
├── <FlowCanvas>                   (React Flow wrapper)
│   ├── <StageNode>                (custom node type — one of 4–5 stage boxes)
│   ├── <Edge>                     (default React Flow edge, styled)
│   ├── <Token />                  (animated SVG dot riding the edges)
│   └── <Tooltip />                (appears above the current node)
│
└── <Legend />                     (tiny bottom bar: node colors + dot meaning)
```

### State shape (Zustand store)

```ts
{
  activeScenario: 'standard' | 'overtime',
  stepIndex: number,                // 0 = not started, up to steps.length
  playing: boolean,
  speed: 0.5 | 1 | 2,
  laborRow: Partial<LaborRow>,      // current state of the data point being traced
  actions: { play, pause, step, stepBack, reset, setScenario, setSpeed }
}
```

### File layout

```
src/
├── main.tsx
├── App.tsx
├── components/
│   ├── Header/...
│   ├── Flow/                      (FlowCanvas, StageNode, Token, Tooltip, Legend)
│   └── PlaybackControls/...
├── engine/
│   ├── store.ts                   (Zustand store + actions)
│   └── scheduler.ts               (advances stepIndex on a timer when playing)
├── scenarios/
│   ├── types.ts                   (Scenario, Step, LaborRow types)
│   ├── pipeline.ts                (13 nodes + edges — shared by both scenarios)
│   ├── standard.ts                (scenario 1: happy path)
│   └── overtime.ts                (scenario 2: catchup redistribution)
└── theme/
    ├── tokens.ts                  (colors + fonts, extracted from Alstom PPTX)
    └── index.css                  (tailwind directives + token application)
```

---

## 5. Pipeline & Scenarios

### The shared diagram — 13 nodes in 4 stages

```
SOURCE        CLEANING                              CONSOLIDATION                                         UPLOAD
──────        ─────────────────────────────         ──────────────────────────────────────────────        ──────
[1]           [2] → [3] → [4] → [5] → [6]           [7] → [8] → [9] ──no──→ [11] → [12]                   [13]
                                                              │
                                                              └──yes──→ [10] ──┘
```

| # | Node label (plain-English)                                       | One-line intent                                                      |
|---|------------------------------------------------------------------|----------------------------------------------------------------------|
| 1 | Regional office payroll system                                   | Row arrives from the Canadian office's SAP export                    |
| 2 | Keep this fiscal year's entries                                  | Drop rows from older years                                           |
| 3 | Keep only time entries (hours)                                   | Drop rows measured in other units (materials, currencies…)           |
| 4 | Merge with other regions                                         | Stack into one table with 11 other offices                           |
| 5 | Pick out the employee's ID                                       | Parse the numeric ID out of the "Name" text field                    |
| 6 | Match the cost category                                          | Look up the project's cost-breakdown key from the project code       |
| 7 | Add the employee's details                                       | Attach cost center + reporting unit from the employee list           |
| 8 | Add up the person's total hours for the month                    | Sum all hours booked by this employee across projects                |
| 9 | Check against the monthly billable maximum                       | Decision: did they exceed the max (e.g. 152h in Nov Canada)?         |
| 10 | Redistribute the overtime across projects                       | Split the excess proportionally back into the projects                |
| 11 | Convert hours into cost                                          | Multiply by the hourly rate to get base + loaded cost                |
| 12 | Write to the consolidated file                                   | Final row in the main workfile                                       |
| 13 | Upload to the cost-management system                             | Row is pushed in the required format                                 |

A glossary chip (top-right, dismissible) expands terms like *cost-breakdown structure*, *loaded cost*, *billable maximum* for attendees who want definitions without cluttering every tooltip.

### Scenario 1 — Standard Canada row (happy path)

Starting row: *"RENAUD T 012345, Canada (5140), project TOR-ITB-015-EL, 48 hours, November 2025."*

Token path: **1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 11 → 12 → 13** (skips node 10).

Sample tooltips:
- **[5]** *"Employee ID '012345' extracted from the name field 'RENAUD T 012345'."*
- **[6]** *"Project code 'TOR-ITB-015-EL' matched to cost category 'ITB.015 — Electrical'."*
- **[8]** *"This 48h row plus Renaud's other rows for November total 140h."*
- **[9]** *"Monthly maximum in Canada for Nov 2025 is 152h. 140h ≤ 152h, so no redistribution needed."*
- **[11]** *"140h × $85/h = $11,900 base cost. With loadings: $15,000."*
- **[13]** *"Row uploaded to the cost-management system."*

### Scenario 2 — Overtime & redistribution (edge case)

Same starting row (48h on the electrical project), but in this scenario the employee logged **180h** total across two projects in November:
- TOR-ITB-015-EL (electrical): 108h
- TOR-ITB-015-ME (mechanical): 72h
(60/40 split)

Token path: **1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13**. At node 10, a visual highlight shows the token briefly fork into two, one per project, sized by the split.

Sample tooltips:
- **[8]** *"Renaud's total for November across both projects: 180h."*
- **[9]** *"Monthly maximum is 152h. 180h > 152h — 28h in overtime. Heading to redistribution."*
- **[10]** *"28h excess split 60/40 across the two projects: +16.8h to the electrical project, +11.2h to the mechanical project, tagged as 'catchup'."*
- **[11]** *"152h at the normal rate, 28h of catchup re-booked across the projects at the same rate."*

Node 10 has a subtle pulsing idle animation to hint that it only fires under certain conditions.

### Scenario data shape

```ts
// scenarios/types.ts
type NodeId = number;
type LaborRow = {
  employeeName?: string;
  employeeId?: string;
  region?: string;
  projectCode?: string;
  costCategory?: string;
  hours?: number;
  totalHours?: number;
  monthlyMax?: number;
  baseCost?: number;
  loadedCost?: number;
  // … further fields added as steps progress
};

type Step = {
  from: NodeId | null;         // null = initial placement at first node
  to: NodeId;
  ms: number;                  // transit time (scaled by speed)
  tooltip: string;             // plain-English, <140 chars
  rowPatch?: Partial<LaborRow>;
};

type Scenario = {
  id: 'standard' | 'overtime';
  title: string;
  startingRow: Partial<LaborRow>;
  steps: Step[];
};
```

---

## 6. Visual Style & Layout

### Brand extraction (during implementation)

The `'#...'` colors and `<from template>` font names in the snippet below are **deliberate placeholders** — actual values are resolved during the implementation phase by opening the PPTX and reading its theme.

At the start of implementation:
1. Open `Alstom New Template.pptx` with the `anthropic-skills:pptx` skill.
2. Extract: theme colors (6–12 swatches), primary typeface, secondary typeface, logo/wordmark if applicable.
3. Write these into `src/theme/tokens.ts` as design tokens:

```ts
export const colors = {
  brandPrimary: '#...',      // from Accent 1 — filled in during implementation
  brandSecondary: '#...',    // from Accent 2
  surface: '#...',           // from Background
  textStrong: '#...',
  textMuted: '#...',
  stageSource: '#...',       // derived, tinted from brand
  stageCleaning: '#...',
  stageConsolidation: '#...',
  stageUpload: '#...',
  edgeIdle: '#...',
  edgeActive: '#...',
  tokenFill: '#...',
};
export const fonts = {
  heading: '"<from template>", ...fallbacks',
  body: '"<from template>", ...fallbacks',
};
```

Tailwind `theme.extend` reads from these tokens. Components reference token names, never hex literals.

### Layout (desktop ≥1280px)

- Full-bleed diagram area below a 60px header bar.
- Header: logo (left), scenario toggle (center), playback controls (right).
- Stage-band tints behind groups of nodes (subtle horizontal bands).
- Legend chip bottom-left (dismissible). Glossary chip top-right (dismissible).
- No sidebars or panels.

### Motion

- Token movement: linear interpolation along the edge's SVG path. Duration per edge: `0.5x = 1600ms`, `1x = 800ms`, `2x = 400ms`.
- Active node: gentle scale (1.0 → 1.04 → 1.0) + brand-accent border on arrival.
- Node 10: subtle pulsing outline when idle (signals conditional branch).
- Edge animation: brief brand-accent highlight along the length during traversal.
- Tooltip: fades ~3s after arrival when playing; persists while paused or hovered.
- Respects `prefers-reduced-motion`: disables pulses, shortens transit, skips scale animations.

---

## 7. Testing Strategy

### Test-driven (logic, pure functions)

**Simulation engine** (`src/engine/`): tests written before implementation.
- `play()` advances one step per tick at the configured speed
- `pause()` stops advancement; subsequent `play()` resumes from the same step
- `step()` advances by exactly one; `stepBack()` rewinds by one
- `reset()` returns to step 0 and clears `laborRow` state
- `setScenario()` swaps the active scenario and resets
- Step side effects on `laborRow` are applied on advance and *reversed* on rewind
- `step` at the last step is a no-op; `stepBack` at step 0 is a no-op

**Scenario data validation** (`src/scenarios/__tests__/validate.test.ts`):
- Every `step.from` / `step.to` resolves to a real node id in `pipeline.ts`
- Scenario 1 path excludes node 10; scenario 2 path includes it
- All tooltips are non-empty and under a character budget

**Pure helpers:** formatters, path interpolation, etc. — unit tested.

### Smoke tests (not TDD)

Written after the component is sketched, using `@testing-library/react` + `vitest`:
- Tooltip renders the current step's text when `stepIndex` changes
- Playback controls dispatch the correct store actions on click
- Scenario toggle changes the active scenario
- Glossary chip opens / closes

React Flow internals are not tested (opaque library — trust it).

### Not automatically tested

- Diagram visual layout, edge paths, node styling — iterated by eye.
- Animation timing — feel-based.

### Commands & CI

- `npm test` — vitest watch
- `npm run test:run` — one-shot
- `npm run test:coverage` — target >90% for engine + scenarios
- Cloudflare Pages build runs `npm run test:run && npm run build`. Failing tests block deploy.

---

## 8. Project Setup & Deploy

### Repo layout

```
C:/Dev/Demo Workshop/
├── .git/                          (remote: github.com/rthomassin/cms-etl-walkthrough)
├── .gitignore                     (node_modules, dist, .env, .wrangler, *.pptx)
├── .nvmrc                         (20)
├── README.md
├── DEPLOY.md                      (step-by-step Cloudflare UI instructions)
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-04-16-etl-walkthrough-design.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── index.html
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── components/…
    ├── engine/…
    ├── scenarios/…
    └── theme/…
```

*(The source PPTX stays on disk for brand extraction but is gitignored.)*

### Dependencies

| Runtime | Dev |
|---|---|
| `react`, `react-dom` | `vite`, `@vitejs/plugin-react` |
| `@xyflow/react` (React Flow v12+) | `typescript`, `@types/react`, `@types/react-dom` |
| `zustand` | `tailwindcss`, `postcss`, `autoprefixer` |
| `clsx` | `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` |
|  | `eslint`, `prettier` |

### Deploy pipeline

1. Git push to `main` on `github.com/rthomassin/cms-etl-walkthrough`.
2. Cloudflare Pages (Vite preset) runs `npm run build`, publishes `dist/`.
3. Custom domain: `workshop.arbrass.ca` — one-click setup since `arbrass.ca` is already on Cloudflare DNS.

### Manual Cloudflare setup (Renaud, one-time, ~3 minutes)

1. Cloudflare dashboard → **Workers & Pages** → **Start building** → Pages → **Connect to Git**.
2. Authorize GitHub if prompted; pick the new repo.
3. Build settings: Framework = **Vite**, Build command = `npm run build`, Output = `dist`, Env var `NODE_VERSION=20`.
4. **Save & Deploy**.
5. Pages project → **Custom domains** → add `workshop.arbrass.ca`.

### Local dev

```bash
npm install
npm run dev       # Vite dev server at http://localhost:5173
npm test          # vitest watch
npm run build     # build into dist/
npm run preview   # preview the built bundle
```

---

## 9. Out of Scope (for this version)

- Tablet and phone layouts (desktop-only for now).
- Real-time sync between presenter and attendee devices.
- Editable scenarios / custom data points (scenarios are pre-authored).
- Authentication or per-user state.
- Additional ETL processes (only the labor path is modeled).
- Animation of reference-data joins (census, rates, CBS) as separate tokens — kept implicit in tooltips.
- Recording / replay export.

These can be added later without rearchitecting; the scenario-engine model is extensible.

---

## 10. Glossary (for implementation reference)

Every acronym or jargon term used anywhere in the app must have an entry here, which also feeds the UI glossary chip.

| Term | Plain-English meaning |
|---|---|
| AFP | Application For Payment — the monthly billing package the team prepares |
| CMS | Cost Management System — Metrolinx's system we upload into |
| CJI3 | The SAP report type that produces the labor hour extracts |
| WBS | Work Breakdown Structure — a project code identifying what a cost is for |
| CBS | Cost Breakdown Structure — the cost-category hierarchy CMS organizes costs under |
| Catchup hours | Overtime hours redistributed proportionally across projects |
| Billable maximum | The maximum hours an employee can bill to projects in a given month |
| Loaded cost | The employee's cost including overhead/benefits loadings on top of the base rate |
| ITB / RHPL | Two project bundles under GO Expansion (Integrated Testing / Rolling Stock) |

(More terms added as the scenario tooltips are authored.)

---

## 11. Success Criteria

The app is done when:

1. Both scenarios play from start to finish without manual intervention, with tooltips appearing and fading correctly.
2. The scenario toggle resets state and switches paths cleanly.
3. Playback controls (play/pause/step/stepBack/reset/speed) work as specified.
4. Every label and tooltip has been reviewed by someone outside the finance team and is understandable without further explanation.
5. `npm run build` produces a `dist/` folder that deploys cleanly to Cloudflare Pages.
6. `workshop.arbrass.ca` serves the app over HTTPS.
7. Test coverage for engine + scenarios is >90%, and CI blocks deploy on failing tests.
