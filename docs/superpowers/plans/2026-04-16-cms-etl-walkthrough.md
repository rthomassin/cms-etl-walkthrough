# CMS ETL Walkthrough — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a desktop-only static web app that visualizes a labor data point traveling through the CMS ETL pipeline with two selectable scenarios (standard, overtime-with-catchup), deployed to `workshop.arbrass.ca` via Cloudflare Pages.

**Architecture:** Single-page React + Vite app using React Flow (`@xyflow/react`) for the node-and-edge diagram, Zustand for state, Tailwind for styling with brand tokens extracted from `Alstom New Template.pptx`. Scenarios are static TS data: ordered step lists that advance a token from node to node and mutate a `laborRow` state. No backend, no sync.

**Tech Stack:** TypeScript, React 18, Vite 5, `@xyflow/react` v12, Zustand 4, Tailwind 3, Vitest, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.

**Spec:** `docs/superpowers/specs/2026-04-16-etl-walkthrough-design.md` — consult for design rationale.

---

## File Structure (target)

```
C:/Dev/Demo Workshop/
├── .git/                                     (exists)
├── .gitignore                                (exists; extended in Task 1)
├── .nvmrc                                    (Task 1)
├── README.md                                 (Task 19)
├── DEPLOY.md                                 (Task 19)
├── package.json                              (Task 1)
├── tsconfig.json, tsconfig.node.json         (Task 1)
├── vite.config.ts                            (Task 1, extended in Task 3)
├── tailwind.config.ts, postcss.config.js     (Task 3)
├── index.html                                (Task 1)
├── public/
│   └── favicon.svg                           (Task 1)
├── docs/superpowers/specs/…                  (exists)
├── docs/superpowers/plans/…                  (this file)
└── src/
    ├── main.tsx, App.tsx, index.css          (Task 1, App extended in Task 18)
    ├── setupTests.ts                         (Task 3)
    ├── theme/tokens.ts                       (Task 4)
    ├── scenarios/
    │   ├── types.ts                          (Task 5)
    │   ├── pipeline.ts                       (Task 6)
    │   ├── standard.ts                       (Task 7)
    │   ├── overtime.ts                       (Task 8)
    │   ├── glossary.ts                       (Task 17)
    │   └── __tests__/validate.test.ts        (Task 9)
    ├── engine/
    │   ├── store.ts                          (Task 10)
    │   ├── scheduler.ts                      (Task 11)
    │   └── __tests__/
    │       ├── store.test.ts                 (Task 10)
    │       └── scheduler.test.ts             (Task 11)
    └── components/
        ├── Flow/
        │   ├── FlowCanvas.tsx                (Task 12)
        │   ├── StageNode.tsx                 (Task 12)
        │   ├── Token.tsx                     (Task 13)
        │   ├── Tooltip.tsx                   (Task 14)
        │   └── Legend.tsx                    (Task 17)
        ├── Header/
        │   ├── Header.tsx                    (Task 15)
        │   ├── BrandLogo.tsx                 (Task 15)
        │   ├── ScenarioToggle.tsx            (Task 15)
        │   └── __tests__/ScenarioToggle.test.tsx  (Task 15)
        ├── PlaybackControls/
        │   ├── PlaybackControls.tsx          (Task 16)
        │   └── __tests__/PlaybackControls.test.tsx (Task 16)
        └── Glossary/
            ├── GlossaryChip.tsx              (Task 17)
            └── __tests__/GlossaryChip.test.tsx (Task 17)
```

---

## Task 1: Manual Vite + React + TS Scaffold

**Why manual:** `npm create vite@latest .` is interactive and refuses non-empty directories. Writing the config files directly is deterministic and produces the same result.

**Files:**
- Create: `.nvmrc`, `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `public/favicon.svg`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Modify: `.gitignore` (append Vite-specific entries)

- [ ] **Step 1: Create `.nvmrc`**

Create `C:/Dev/Demo Workshop/.nvmrc`:
```
20
```

- [ ] **Step 2: Create `package.json`**

Create `C:/Dev/Demo Workshop/package.json`:
```json
{
  "name": "cms-etl-walkthrough",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

- [ ] **Step 3: Create `tsconfig.json`**

Create `C:/Dev/Demo Workshop/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create `tsconfig.node.json`**

Create `C:/Dev/Demo Workshop/tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "tailwind.config.ts", "postcss.config.js"]
}
```

- [ ] **Step 5: Create `vite.config.ts`**

Create `C:/Dev/Demo Workshop/vite.config.ts`:
```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
});
```

- [ ] **Step 6: Create `index.html`**

Create `C:/Dev/Demo Workshop/index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=1280" />
    <title>CMS ETL Walkthrough</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create placeholder favicon**

Create `C:/Dev/Demo Workshop/public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#0a4d8c"/></svg>
```

(Will be replaced with Alstom mark in Task 4 if available.)

- [ ] **Step 8: Create minimal `src/main.tsx`**

Create `C:/Dev/Demo Workshop/src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 9: Create minimal `src/App.tsx`**

Create `C:/Dev/Demo Workshop/src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold">CMS ETL Walkthrough — scaffold ok</h1>
    </div>
  );
}
```

- [ ] **Step 10: Create minimal `src/index.css`**

Create `C:/Dev/Demo Workshop/src/index.css`:
```css
/* Tailwind layers wired in Task 3 */
html, body, #root { height: 100%; }
body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, sans-serif; }
```

- [ ] **Step 11: Extend `.gitignore`**

The existing `.gitignore` already covers `node_modules`, `dist`, `.env`, `.wrangler`, `*.pptx`. Verify by reading it; it was created during the brainstorming session and should be correct. No changes needed if the content matches.

- [ ] **Step 12: Commit the scaffold**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add .nvmrc package.json tsconfig.json tsconfig.node.json vite.config.ts index.html public/ src/ && git commit -m "$(cat <<'EOF'
chore: vite + react + ts scaffold

Manual scaffold (no npm create vite) to avoid interactive prompts.
Configures TypeScript, Vite with Vitest, placeholder App renders
"scaffold ok" to confirm the boot path works before deps install.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Install Runtime + Dev Dependencies

**Files:**
- Modify: `package.json` (dependencies + devDependencies added by npm)
- Create: `package-lock.json`
- Create: `node_modules/` (gitignored)

- [ ] **Step 1: Install runtime dependencies**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm install react@18 react-dom@18 @xyflow/react zustand clsx
```

Expected: installs succeed, no peer-dep errors.

- [ ] **Step 2: Install dev dependencies**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm install -D typescript@5 @types/react@18 @types/react-dom@18 @vitejs/plugin-react vite@5 vitest@1 @testing-library/react@15 @testing-library/jest-dom@6 @testing-library/user-event@14 jsdom@24 tailwindcss@3 postcss@8 autoprefixer@10 @vitest/coverage-v8@1
```

Expected: installs succeed.

- [ ] **Step 3: Verify dev server boots**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm run dev
```

Expected: Vite logs `Local: http://localhost:5173/`. Open that URL in a browser → you should see *"CMS ETL Walkthrough — scaffold ok"*. Press Ctrl+C to stop.

- [ ] **Step 4: Commit lockfile + updated package.json**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add package.json package-lock.json && git commit -m "$(cat <<'EOF'
chore: install runtime and dev dependencies

React 18, @xyflow/react v12, Zustand 4, clsx. Dev: Vite 5, Vitest 1,
Testing Library, jsdom, Tailwind 3. Dev server confirmed booting.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Tailwind + Vitest Test Setup

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`, `src/setupTests.ts`
- Modify: `src/index.css` (add Tailwind directives)
- Create: `src/__tests__/smoke.test.tsx` (delete after Step 5 passes)

- [ ] **Step 1: Create `postcss.config.js`**

Create `C:/Dev/Demo Workshop/postcss.config.js`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 2: Create `tailwind.config.ts`**

Create `C:/Dev/Demo Workshop/tailwind.config.ts`. We'll wire real brand tokens in Task 4; this is the scaffold.
```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Brand tokens filled in Task 4
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 3: Wire Tailwind into `src/index.css`**

Replace contents of `C:/Dev/Demo Workshop/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }
body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, sans-serif; }
```

- [ ] **Step 4: Create `src/setupTests.ts`**

Create `C:/Dev/Demo Workshop/src/setupTests.ts`:
```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Write a smoke test to verify the test harness works**

Create `C:/Dev/Demo Workshop/src/__tests__/smoke.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('harness smoke', () => {
  it('renders the scaffold heading', () => {
    render(<App />);
    expect(screen.getByText(/scaffold ok/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run the test**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm run test:run
```

Expected: `1 passed`.

- [ ] **Step 7: Delete the temporary smoke test**

Delete `C:/Dev/Demo Workshop/src/__tests__/smoke.test.tsx`. (It exists only to prove the harness works; real tests come in later tasks.)

- [ ] **Step 8: Verify Tailwind is applied**

Run `npm run dev`, open `http://localhost:5173/`. The heading should now be rendered with the Tailwind `text-2xl` size (visibly larger than the default). Ctrl+C to stop.

- [ ] **Step 9: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add tailwind.config.ts postcss.config.js src/setupTests.ts src/index.css && git commit -m "$(cat <<'EOF'
chore: configure tailwind and vitest

Tailwind 3 with content scanning of index.html + src/**/*.tsx.
Vitest jsdom environment, jest-dom matchers loaded via setupTests.
Smoke test confirmed harness works, then removed.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Extract Brand Tokens from PPTX

**Files:**
- Create: `src/theme/tokens.ts`
- Modify: `tailwind.config.ts` (read from tokens)
- Possibly create: `public/alstom-logo.svg` (if logo is extractable and licensing permits)

**Goal:** Populate `tokens.ts` with real brand colors and fonts, derived from `Alstom New Template.pptx`.

- [ ] **Step 1: Extract theme colors and fonts from the PPTX**

Invoke the `anthropic-skills:pptx` skill, pointing it at `C:/Dev/Demo Workshop/Alstom New Template.pptx`. Ask specifically for:
- Theme color palette (usually 6 colors: Background1, Text1, Background2, Text2, Accent1–Accent6)
- Major font (headings) and Minor font (body) from the theme
- Any notable logo shape on the slide master

The skill will typically parse `ppt/theme/theme1.xml` to retrieve these. Record hex codes and font names.

- [ ] **Step 2: Write `src/theme/tokens.ts` with the extracted values**

Create `C:/Dev/Demo Workshop/src/theme/tokens.ts`. Substitute the hex values and font names the pptx skill returned. If a font is not web-available, fall back to a close web-safe or Google Font alternative; note the fallback in a comment.

Example (replace placeholder hexes/fonts with real extracted values):
```ts
// Extracted from Alstom New Template.pptx on 2026-04-16.
// Source: ppt/theme/theme1.xml (theme colors) + slide master (fonts).

export const colors = {
  // Brand
  brandPrimary:    '#REPLACE_WITH_ACCENT1',
  brandSecondary:  '#REPLACE_WITH_ACCENT2',
  brandAccent:     '#REPLACE_WITH_ACCENT3',
  // Surfaces
  surface:         '#REPLACE_WITH_BG1',
  surfaceAlt:      '#REPLACE_WITH_BG2',
  // Text
  textStrong:      '#REPLACE_WITH_TEXT1',
  textMuted:       '#REPLACE_WITH_TEXT2',
  // Pipeline stage tints (derived — lighter shades of brand colors)
  stageSource:         '#REPLACE',
  stageCleaning:       '#REPLACE',
  stageConsolidation:  '#REPLACE',
  stageUpload:         '#REPLACE',
  // Edges + token
  edgeIdle:        '#c2c7cc',
  edgeActive:      '#REPLACE_WITH_ACCENT1',
  tokenFill:       '#REPLACE_WITH_ACCENT2',
} as const;

export const fonts = {
  heading: '"<extracted heading font>", "Segoe UI", system-ui, sans-serif',
  body:    '"<extracted body font>", "Segoe UI", system-ui, sans-serif',
} as const;
```

If the extracted font is not freely available on the web, either bundle it locally under `public/fonts/` (only if licensing permits) or substitute a Google Font approximation (e.g., Alstom's corporate typeface is often replaced with **Lato** or **Open Sans** in web contexts — pick a close match and note the substitution in a comment).

- [ ] **Step 3: Wire tokens into `tailwind.config.ts`**

Replace contents of `C:/Dev/Demo Workshop/tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss';
import { colors, fonts } from './src/theme/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: colors.brandPrimary,
          secondary: colors.brandSecondary,
          accent: colors.brandAccent,
        },
        surface: {
          DEFAULT: colors.surface,
          alt: colors.surfaceAlt,
        },
        text: {
          strong: colors.textStrong,
          muted: colors.textMuted,
        },
        stage: {
          source: colors.stageSource,
          cleaning: colors.stageCleaning,
          consolidation: colors.stageConsolidation,
          upload: colors.stageUpload,
        },
        edge: {
          idle: colors.edgeIdle,
          active: colors.edgeActive,
        },
        token: {
          fill: colors.tokenFill,
        },
      },
      fontFamily: {
        heading: fonts.heading,
        body: fonts.body,
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 4: Apply brand font to `src/App.tsx` for visual verification**

Temporarily change `src/App.tsx` to use the brand colors + fonts so you can visually confirm extraction worked:
```tsx
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <h1 className="text-2xl font-heading text-brand-primary">Brand check</h1>
    </div>
  );
}
```

Run `npm run dev`, open the page. The background should be the template's background color and the heading should be in the template's brand color + heading font. Ctrl+C.

- [ ] **Step 5: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add src/theme/tokens.ts tailwind.config.ts src/App.tsx && git commit -m "$(cat <<'EOF'
feat: extract brand tokens from alstom pptx

Colors (primary, secondary, accent, surfaces, text) and heading/body
fonts pulled from ppt/theme/theme1.xml. Wired into tailwind.config via
theme.extend so components reference tokens (bg-surface, text-brand-primary)
and never hex literals. Stage tints derived as lighter shades of brand.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Core Types

**Files:**
- Create: `src/scenarios/types.ts`

- [ ] **Step 1: Write the types**

Create `C:/Dev/Demo Workshop/src/scenarios/types.ts`:
```ts
export type NodeId = number;

export type Stage = 'source' | 'cleaning' | 'consolidation' | 'upload';

export type LaborRow = {
  employeeName?: string;
  employeeId?: string;
  region?: string;
  projectCode?: string;
  costCategory?: string;
  costCenter?: string;
  reportingUnit?: string;
  hours?: number;              // the specific row's hours
  totalHoursThisMonth?: number; // sum across all rows for this employee
  monthlyMax?: number;
  overtimeHours?: number;
  catchupByProject?: { projectCode: string; hours: number }[];
  hourlyRate?: number;
  baseCost?: number;
  loadedCost?: number;
};

export type PipelineNode = {
  id: NodeId;
  label: string;         // plain-English, no acronyms
  stage: Stage;
  position: { x: number; y: number };
  /** Optional: conditional nodes pulse when idle (e.g. redistribution). */
  conditional?: boolean;
};

export type PipelineEdge = {
  id: string;            // `${from}-${to}`
  from: NodeId;
  to: NodeId;
};

export type Step = {
  /** null means initial placement at `to`. */
  from: NodeId | null;
  to: NodeId;
  /** Transit time in ms at speed 1x. Scaled by store.speed. */
  ms: number;
  /** Plain-English, under 140 chars. */
  tooltip: string;
  /** Values merged into laborRow on arrival. */
  rowPatch?: Partial<LaborRow>;
};

export type ScenarioId = 'standard' | 'overtime';

export type Scenario = {
  id: ScenarioId;
  title: string;
  subtitle: string;
  startingRow: Partial<LaborRow>;
  steps: Step[];
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npx tsc -b --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add src/scenarios/types.ts && git commit -m "$(cat <<'EOF'
feat: define scenario + pipeline types

LaborRow captures every field a tooltip may surface. Step has optional
rowPatch that merges on arrival. Scenario bundles startingRow + ordered
steps. All types explicit — no any, no string-literal unions outside
narrowly-defined identifiers.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Pipeline Nodes and Edges

**Files:**
- Create: `src/scenarios/pipeline.ts`

The 13 nodes are laid out left-to-right across four stage bands. Node 10 sits below the main row to make the conditional branch visually obvious.

- [ ] **Step 1: Write `src/scenarios/pipeline.ts`**

Create `C:/Dev/Demo Workshop/src/scenarios/pipeline.ts`:
```ts
import type { PipelineEdge, PipelineNode } from './types';

/** X positions are hand-tuned for a 1280+ viewport; Y=300 main row, Y=450 branch. */
export const pipelineNodes: PipelineNode[] = [
  { id: 1,  label: 'Regional office payroll system',             stage: 'source',        position: { x:   60, y: 300 } },
  { id: 2,  label: "Keep this fiscal year's entries",            stage: 'cleaning',      position: { x:  240, y: 300 } },
  { id: 3,  label: 'Keep only time entries (hours)',             stage: 'cleaning',      position: { x:  420, y: 300 } },
  { id: 4,  label: 'Merge with other regions',                   stage: 'cleaning',      position: { x:  600, y: 300 } },
  { id: 5,  label: "Pick out the employee's ID",                 stage: 'cleaning',      position: { x:  780, y: 300 } },
  { id: 6,  label: 'Match the cost category',                    stage: 'cleaning',      position: { x:  960, y: 300 } },
  { id: 7,  label: "Add the employee's details",                 stage: 'consolidation', position: { x: 1140, y: 300 } },
  { id: 8,  label: "Add up the person's total hours for the month", stage: 'consolidation', position: { x: 1320, y: 300 } },
  { id: 9,  label: 'Check against the monthly billable maximum', stage: 'consolidation', position: { x: 1500, y: 300 } },
  { id: 10, label: 'Redistribute the overtime across projects',  stage: 'consolidation', position: { x: 1680, y: 450 }, conditional: true },
  { id: 11, label: 'Convert hours into cost',                    stage: 'consolidation', position: { x: 1860, y: 300 } },
  { id: 12, label: 'Write to the consolidated file',             stage: 'consolidation', position: { x: 2040, y: 300 } },
  { id: 13, label: 'Upload to the cost-management system',       stage: 'upload',        position: { x: 2220, y: 300 } },
];

/**
 * Edges include both branches at node 9:
 *   9 → 11 (no-overtime direct path)
 *   9 → 10 → 11 (overtime via redistribution)
 */
export const pipelineEdges: PipelineEdge[] = [
  { id: '1-2',   from: 1,  to: 2  },
  { id: '2-3',   from: 2,  to: 3  },
  { id: '3-4',   from: 3,  to: 4  },
  { id: '4-5',   from: 4,  to: 5  },
  { id: '5-6',   from: 5,  to: 6  },
  { id: '6-7',   from: 6,  to: 7  },
  { id: '7-8',   from: 7,  to: 8  },
  { id: '8-9',   from: 8,  to: 9  },
  { id: '9-11',  from: 9,  to: 11 },
  { id: '9-10',  from: 9,  to: 10 },
  { id: '10-11', from: 10, to: 11 },
  { id: '11-12', from: 11, to: 12 },
  { id: '12-13', from: 12, to: 13 },
];

/** Lookup helpers used by the engine + components. */
export function getNode(id: number): PipelineNode {
  const node = pipelineNodes.find(n => n.id === id);
  if (!node) throw new Error(`Pipeline node ${id} not found`);
  return node;
}

export function getEdge(from: number, to: number): PipelineEdge {
  const edge = pipelineEdges.find(e => e.from === from && e.to === to);
  if (!edge) throw new Error(`Pipeline edge ${from} → ${to} not found`);
  return edge;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npx tsc -b --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add src/scenarios/pipeline.ts && git commit -m "$(cat <<'EOF'
feat: define 13-node pipeline with branch at node 9

Nodes laid out for 1280+ viewport: main row at y=300, conditional
redistribution node at y=450. Edges cover both branches (direct 9→11
and overtime 9→10→11). Labels are plain English per spec.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Standard Scenario Steps

**Files:**
- Create: `src/scenarios/standard.ts`

- [ ] **Step 1: Write the standard scenario**

Create `C:/Dev/Demo Workshop/src/scenarios/standard.ts`:
```ts
import type { Scenario } from './types';

export const standardScenario: Scenario = {
  id: 'standard',
  title: 'Standard Canada row',
  subtitle: "Everything fits inside the monthly maximum — no redistribution.",
  startingRow: {
    employeeName: 'RENAUD T 012345',
    region: 'Canada',
    projectCode: 'TOR-ITB-015-EL',
    hours: 48,
  },
  steps: [
    {
      from: null, to: 1, ms: 400,
      tooltip: "A new row arrives from Canada's payroll system: 48 hours on project TOR-ITB-015-EL.",
    },
    {
      from: 1, to: 2, ms: 800,
      tooltip: "Fiscal year 2025 — kept.",
    },
    {
      from: 2, to: 3, ms: 800,
      tooltip: "Measured in hours — kept. (Non-hour units go through a parallel process.)",
    },
    {
      from: 3, to: 4, ms: 800,
      tooltip: "Stacked with rows from the other 11 regional offices into one table.",
    },
    {
      from: 4, to: 5, ms: 800,
      tooltip: "Employee ID '012345' extracted from the name field 'RENAUD T 012345'.",
      rowPatch: { employeeId: '012345' },
    },
    {
      from: 5, to: 6, ms: 800,
      tooltip: "Project code TOR-ITB-015-EL matched to cost category ITB.015 — Electrical.",
      rowPatch: { costCategory: 'ITB.015 — Electrical' },
    },
    {
      from: 6, to: 7, ms: 800,
      tooltip: "Cost center and reporting unit attached from the employee list.",
      rowPatch: { costCenter: 'CA-TOR-ENG', reportingUnit: 'Toronto Engineering' },
    },
    {
      from: 7, to: 8, ms: 800,
      tooltip: "This 48h row plus Renaud's other rows for November total 140h.",
      rowPatch: { totalHoursThisMonth: 140 },
    },
    {
      from: 8, to: 9, ms: 800,
      tooltip: "Monthly maximum in Canada for Nov 2025 is 152h. 140h ≤ 152h, so no redistribution needed.",
      rowPatch: { monthlyMax: 152 },
    },
    {
      from: 9, to: 11, ms: 1000,
      tooltip: "Skipping the redistribution step (no overtime).",
    },
    {
      from: 11, to: 12, ms: 800,
      tooltip: "140h × $85/h = $11,900 base cost. With loadings: $15,000.",
      rowPatch: { hourlyRate: 85, baseCost: 11900, loadedCost: 15000 },
    },
    {
      from: 12, to: 13, ms: 800,
      tooltip: "Row written into the consolidated workfile.",
    },
    // Final settle step — keeps the token visible on node 13 for a beat.
    {
      from: 13, to: 13, ms: 300,
      tooltip: "Row uploaded to the cost-management system. Done.",
    },
  ],
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npx tsc -b --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add src/scenarios/standard.ts && git commit -m "$(cat <<'EOF'
feat: standard scenario (happy-path canada row)

13 steps carrying a 48h Canada row through the pipeline. Branches
9→11 (skips redistribution). Tooltips are plain English and stay
inside the 140-char budget. Row patches accumulate to a final
140h × $85/h = $15,000 loaded cost.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Overtime Scenario Steps

**Files:**
- Create: `src/scenarios/overtime.ts`

- [ ] **Step 1: Write the overtime scenario**

Create `C:/Dev/Demo Workshop/src/scenarios/overtime.ts`:
```ts
import type { Scenario } from './types';

export const overtimeScenario: Scenario = {
  id: 'overtime',
  title: 'Overtime & redistribution',
  subtitle: 'The monthly maximum is exceeded — watch the excess get split back across projects.',
  startingRow: {
    employeeName: 'RENAUD T 012345',
    region: 'Canada',
    projectCode: 'TOR-ITB-015-EL',
    hours: 48,
  },
  steps: [
    {
      from: null, to: 1, ms: 400,
      tooltip: "A new row arrives from Canada's payroll system: 48 hours on project TOR-ITB-015-EL.",
    },
    {
      from: 1, to: 2, ms: 800,
      tooltip: "Fiscal year 2025 — kept.",
    },
    {
      from: 2, to: 3, ms: 800,
      tooltip: "Measured in hours — kept.",
    },
    {
      from: 3, to: 4, ms: 800,
      tooltip: "Stacked with rows from the other 11 regional offices into one table.",
    },
    {
      from: 4, to: 5, ms: 800,
      tooltip: "Employee ID '012345' extracted from the name field 'RENAUD T 012345'.",
      rowPatch: { employeeId: '012345' },
    },
    {
      from: 5, to: 6, ms: 800,
      tooltip: "Project code TOR-ITB-015-EL matched to cost category ITB.015 — Electrical.",
      rowPatch: { costCategory: 'ITB.015 — Electrical' },
    },
    {
      from: 6, to: 7, ms: 800,
      tooltip: "Cost center and reporting unit attached from the employee list.",
      rowPatch: { costCenter: 'CA-TOR-ENG', reportingUnit: 'Toronto Engineering' },
    },
    {
      from: 7, to: 8, ms: 800,
      tooltip: "Renaud's total for November across both projects: 180h (108h electrical + 72h mechanical).",
      rowPatch: { totalHoursThisMonth: 180 },
    },
    {
      from: 8, to: 9, ms: 800,
      tooltip: "Monthly maximum is 152h. 180h > 152h — 28h in overtime. Heading to redistribution.",
      rowPatch: { monthlyMax: 152, overtimeHours: 28 },
    },
    {
      from: 9, to: 10, ms: 1000,
      tooltip: "Entering redistribution — the 28h excess needs to be split back across the projects.",
    },
    {
      from: 10, to: 11, ms: 1200,
      tooltip: "28h split 60/40 across the two projects: +16.8h electrical, +11.2h mechanical, tagged 'catchup'.",
      rowPatch: {
        catchupByProject: [
          { projectCode: 'TOR-ITB-015-EL', hours: 16.8 },
          { projectCode: 'TOR-ITB-015-ME', hours: 11.2 },
        ],
      },
    },
    {
      from: 11, to: 12, ms: 800,
      tooltip: "152h at the normal rate, 28h of catchup re-booked across the projects at the same rate.",
      rowPatch: { hourlyRate: 85, baseCost: 15300, loadedCost: 19303 },
    },
    {
      from: 12, to: 13, ms: 800,
      tooltip: "Row (plus its catchup siblings) written into the consolidated workfile.",
    },
    {
      from: 13, to: 13, ms: 300,
      tooltip: "Row uploaded to the cost-management system. Done.",
    },
  ],
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npx tsc -b --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add src/scenarios/overtime.ts && git commit -m "$(cat <<'EOF'
feat: overtime scenario with catchup redistribution

14 steps. Same starting row, but total monthly = 180h (28h overtime).
Takes the 9→10→11 branch. Catchup split 60/40 across two projects
(16.8h electrical, 11.2h mechanical) with plain-English tooltips.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Scenario Validation Tests

**Files:**
- Create: `src/scenarios/__tests__/validate.test.ts`

Validate both scenarios against the pipeline structure so typos or drift get caught immediately.

- [ ] **Step 1: Write the validation tests**

Create `C:/Dev/Demo Workshop/src/scenarios/__tests__/validate.test.ts`:
```ts
import { pipelineNodes, pipelineEdges } from '../pipeline';
import { standardScenario } from '../standard';
import { overtimeScenario } from '../overtime';
import type { Scenario } from '../types';

const nodeIds = new Set(pipelineNodes.map(n => n.id));
const edgeKeys = new Set(pipelineEdges.map(e => `${e.from}-${e.to}`));

function validate(scenario: Scenario, label: string) {
  describe(`${label} (${scenario.id})`, () => {
    it('has a non-empty title and subtitle', () => {
      expect(scenario.title.length).toBeGreaterThan(0);
      expect(scenario.subtitle.length).toBeGreaterThan(0);
    });

    it('starts with a placement step (from === null)', () => {
      expect(scenario.steps[0].from).toBeNull();
    });

    it('has every step referencing an existing "to" node', () => {
      for (const step of scenario.steps) {
        expect(nodeIds.has(step.to)).toBe(true);
      }
    });

    it('has every transition matching a defined pipeline edge (except self-loops and placement)', () => {
      for (const step of scenario.steps) {
        if (step.from === null) continue;
        if (step.from === step.to) continue; // settle step
        expect(edgeKeys.has(`${step.from}-${step.to}`)).toBe(true);
      }
    });

    it('keeps every tooltip under 180 characters', () => {
      for (const step of scenario.steps) {
        expect(step.tooltip.length).toBeGreaterThan(0);
        expect(step.tooltip.length).toBeLessThanOrEqual(180);
      }
    });

    it('has strictly positive transit times', () => {
      for (const step of scenario.steps) {
        expect(step.ms).toBeGreaterThan(0);
      }
    });
  });
}

validate(standardScenario, 'standard scenario');
validate(overtimeScenario, 'overtime scenario');

describe('scenario branching', () => {
  const standardHits = new Set(standardScenario.steps.map(s => s.to));
  const overtimeHits = new Set(overtimeScenario.steps.map(s => s.to));

  it('standard scenario does NOT visit node 10 (redistribution)', () => {
    expect(standardHits.has(10)).toBe(false);
  });

  it('overtime scenario DOES visit node 10 (redistribution)', () => {
    expect(overtimeHits.has(10)).toBe(true);
  });

  it('both scenarios end at node 13', () => {
    expect(standardScenario.steps.at(-1)?.to).toBe(13);
    expect(overtimeScenario.steps.at(-1)?.to).toBe(13);
  });
});
```

- [ ] **Step 2: Run the tests**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm run test:run -- src/scenarios
```

Expected: all tests pass. If any fails, inspect the specific assertion — it indicates a drift between the scenario data and the pipeline.

- [ ] **Step 3: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add src/scenarios/__tests__/validate.test.ts && git commit -m "$(cat <<'EOF'
test: validate scenarios against the pipeline

Every step references a real node; every transition matches a defined
edge; tooltips are within the character budget; standard skips node 10
while overtime visits it; both end at node 13.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Zustand Store (TDD)

**Files:**
- Create: `src/engine/store.ts`, `src/engine/__tests__/store.test.ts`

The store owns: active scenario, step index, play state, speed, current `laborRow`. Row state is **recomputed from scratch** on every step change (apply all rowPatches from step 0..stepIndex) — simpler than maintaining reversal patches, and 14 patches is trivial.

- [ ] **Step 1: Write store tests (TDD)**

Create `C:/Dev/Demo Workshop/src/engine/__tests__/store.test.ts`:
```ts
import { beforeEach } from 'vitest';
import { useStore } from '../store';
import { standardScenario } from '../../scenarios/standard';
import { overtimeScenario } from '../../scenarios/overtime';

beforeEach(() => {
  useStore.getState().actions.reset();
  useStore.setState({ activeScenario: 'standard' });
});

describe('store — initial state', () => {
  it('starts on standard scenario, step 0, not playing, 1x speed', () => {
    const s = useStore.getState();
    expect(s.activeScenario).toBe('standard');
    expect(s.stepIndex).toBe(0);
    expect(s.playing).toBe(false);
    expect(s.speed).toBe(1);
  });

  it('starts with the standard scenario starting row', () => {
    const s = useStore.getState();
    expect(s.laborRow.employeeName).toBe(standardScenario.startingRow.employeeName);
  });
});

describe('store — step / stepBack', () => {
  it('step() advances by one and applies rowPatch', () => {
    useStore.getState().actions.step(); // from 0 to 1 (first step, sets nothing extra)
    useStore.getState().actions.step(); // to 2
    useStore.getState().actions.step(); // to 3
    useStore.getState().actions.step(); // to 4
    useStore.getState().actions.step(); // to 5 — employeeId patch applied
    expect(useStore.getState().stepIndex).toBe(5);
    expect(useStore.getState().laborRow.employeeId).toBe('012345');
  });

  it('stepBack() rewinds by one and un-applies later patches', () => {
    const { step, stepBack } = useStore.getState().actions;
    step(); step(); step(); step(); step(); // at step 5, employeeId set
    stepBack();                              // back to step 4, employeeId cleared
    expect(useStore.getState().stepIndex).toBe(4);
    expect(useStore.getState().laborRow.employeeId).toBeUndefined();
  });

  it('step() at the last step is a no-op', () => {
    const total = standardScenario.steps.length;
    useStore.setState({ stepIndex: total });
    useStore.getState().actions.step();
    expect(useStore.getState().stepIndex).toBe(total);
  });

  it('stepBack() at step 0 is a no-op', () => {
    useStore.getState().actions.stepBack();
    expect(useStore.getState().stepIndex).toBe(0);
  });
});

describe('store — play / pause', () => {
  it('play() sets playing=true', () => {
    useStore.getState().actions.play();
    expect(useStore.getState().playing).toBe(true);
  });

  it('pause() sets playing=false', () => {
    useStore.getState().actions.play();
    useStore.getState().actions.pause();
    expect(useStore.getState().playing).toBe(false);
  });
});

describe('store — reset', () => {
  it('reset() returns to step 0, pauses, rebuilds starting row', () => {
    const { step, play, reset } = useStore.getState().actions;
    step(); step(); play();
    reset();
    const s = useStore.getState();
    expect(s.stepIndex).toBe(0);
    expect(s.playing).toBe(false);
    expect(s.laborRow.employeeId).toBeUndefined();
    expect(s.laborRow.employeeName).toBe(standardScenario.startingRow.employeeName);
  });
});

describe('store — setScenario', () => {
  it('swaps the active scenario and resets state', () => {
    const { step, setScenario } = useStore.getState().actions;
    step(); step();
    setScenario('overtime');
    const s = useStore.getState();
    expect(s.activeScenario).toBe('overtime');
    expect(s.stepIndex).toBe(0);
    expect(s.playing).toBe(false);
    expect(s.laborRow.employeeName).toBe(overtimeScenario.startingRow.employeeName);
  });
});

describe('store — setSpeed', () => {
  it.each([0.5, 1, 2])('accepts speed %f', (speed) => {
    useStore.getState().actions.setSpeed(speed as 0.5 | 1 | 2);
    expect(useStore.getState().speed).toBe(speed);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm run test:run -- src/engine/__tests__/store.test.ts
```

Expected: FAIL with "Cannot find module '../store'".

- [ ] **Step 3: Implement the store**

Create `C:/Dev/Demo Workshop/src/engine/store.ts`:
```ts
import { create } from 'zustand';
import { standardScenario } from '../scenarios/standard';
import { overtimeScenario } from '../scenarios/overtime';
import type { LaborRow, Scenario, ScenarioId } from '../scenarios/types';

const SCENARIOS: Record<ScenarioId, Scenario> = {
  standard: standardScenario,
  overtime: overtimeScenario,
};

type Speed = 0.5 | 1 | 2;

type StoreState = {
  activeScenario: ScenarioId;
  stepIndex: number;
  playing: boolean;
  speed: Speed;
  laborRow: Partial<LaborRow>;
  actions: {
    play: () => void;
    pause: () => void;
    step: () => void;
    stepBack: () => void;
    reset: () => void;
    setScenario: (id: ScenarioId) => void;
    setSpeed: (s: Speed) => void;
  };
};

/** Recompute laborRow by applying startingRow + rowPatches from step 0..index-1. */
function computeRow(scenario: Scenario, stepIndex: number): Partial<LaborRow> {
  let row: Partial<LaborRow> = { ...scenario.startingRow };
  const upTo = Math.min(stepIndex, scenario.steps.length);
  for (let i = 0; i < upTo; i++) {
    const patch = scenario.steps[i].rowPatch;
    if (patch) row = { ...row, ...patch };
  }
  return row;
}

export const useStore = create<StoreState>((set, get) => ({
  activeScenario: 'standard',
  stepIndex: 0,
  playing: false,
  speed: 1,
  laborRow: { ...standardScenario.startingRow },

  actions: {
    play: () => set({ playing: true }),
    pause: () => set({ playing: false }),

    step: () => {
      const { activeScenario, stepIndex } = get();
      const scenario = SCENARIOS[activeScenario];
      if (stepIndex >= scenario.steps.length) return;
      const next = stepIndex + 1;
      set({ stepIndex: next, laborRow: computeRow(scenario, next) });
    },

    stepBack: () => {
      const { activeScenario, stepIndex } = get();
      if (stepIndex <= 0) return;
      const scenario = SCENARIOS[activeScenario];
      const next = stepIndex - 1;
      set({ stepIndex: next, laborRow: computeRow(scenario, next) });
    },

    reset: () => {
      const scenario = SCENARIOS[get().activeScenario];
      set({
        stepIndex: 0,
        playing: false,
        laborRow: { ...scenario.startingRow },
      });
    },

    setScenario: (id) => {
      const scenario = SCENARIOS[id];
      set({
        activeScenario: id,
        stepIndex: 0,
        playing: false,
        laborRow: { ...scenario.startingRow },
      });
    },

    setSpeed: (s) => set({ speed: s }),
  },
}));

/** Expose for the scheduler without needing the hook form. */
export function getActiveScenario(): Scenario {
  return SCENARIOS[useStore.getState().activeScenario];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm run test:run -- src/engine/__tests__/store.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add src/engine/store.ts src/engine/__tests__/store.test.ts && git commit -m "$(cat <<'EOF'
feat(engine): zustand store with play/pause/step/reset/setScenario

Tests-first. Row state is recomputed from startingRow + all patches
up to stepIndex — simpler than reverse patches and cheap for 14 steps.
Boundary cases covered: step past end, stepBack before start, scenario
swap clears state.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Scheduler (TDD)

**Files:**
- Create: `src/engine/scheduler.ts`, `src/engine/__tests__/scheduler.test.ts`

The scheduler is a React hook that, when `playing` is true, calls `store.actions.step()` after the current step's `ms / speed` elapses, repeating until the scenario ends.

- [ ] **Step 1: Write scheduler tests (TDD)**

Create `C:/Dev/Demo Workshop/src/engine/__tests__/scheduler.test.ts`:
```ts
import { renderHook, act } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import { useScheduler } from '../scheduler';
import { useStore } from '../store';

beforeEach(() => {
  vi.useFakeTimers();
  useStore.getState().actions.reset();
  useStore.setState({ activeScenario: 'standard', speed: 1 });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('scheduler', () => {
  it('does nothing while paused', () => {
    renderHook(() => useScheduler());
    act(() => { vi.advanceTimersByTime(5000); });
    expect(useStore.getState().stepIndex).toBe(0);
  });

  it('advances one step after the first step ms when playing', () => {
    renderHook(() => useScheduler());
    act(() => { useStore.getState().actions.play(); });
    // First scenario step has ms=400
    act(() => { vi.advanceTimersByTime(400); });
    expect(useStore.getState().stepIndex).toBe(1);
  });

  it('advances sequentially through multiple steps', () => {
    renderHook(() => useScheduler());
    act(() => { useStore.getState().actions.play(); });
    // Steps 1..3 are 400, 800, 800 ms — total 2000
    act(() => { vi.advanceTimersByTime(2000); });
    expect(useStore.getState().stepIndex).toBe(3);
  });

  it('stops at the last step and sets playing=false', () => {
    renderHook(() => useScheduler());
    act(() => { useStore.getState().actions.play(); });
    // Advance far past the scenario's total duration
    act(() => { vi.advanceTimersByTime(60_000); });
    const s = useStore.getState();
    expect(s.stepIndex).toBeGreaterThanOrEqual(13);
    expect(s.playing).toBe(false);
  });

  it('respects the speed multiplier (2x takes half the time)', () => {
    renderHook(() => useScheduler());
    act(() => { useStore.getState().actions.setSpeed(2); });
    act(() => { useStore.getState().actions.play(); });
    // First step is 400ms at 1x → 200ms at 2x
    act(() => { vi.advanceTimersByTime(200); });
    expect(useStore.getState().stepIndex).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm run test:run -- src/engine/__tests__/scheduler.test.ts
```

Expected: FAIL with "Cannot find module '../scheduler'".

- [ ] **Step 3: Implement the scheduler**

Create `C:/Dev/Demo Workshop/src/engine/scheduler.ts`:
```ts
import { useEffect, useRef } from 'react';
import { useStore, getActiveScenario } from './store';

/**
 * Schedules automatic advancement when playing. Reads each upcoming step's ms,
 * scales by speed, fires store.actions.step() on the timer. Auto-pauses at
 * end of scenario. Clears timer on pause, speed change, scenario swap, reset,
 * or unmount.
 */
export function useScheduler() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playing    = useStore(s => s.playing);
  const stepIndex  = useStore(s => s.stepIndex);
  const speed      = useStore(s => s.speed);
  const scenarioId = useStore(s => s.activeScenario);

  useEffect(() => {
    if (!playing) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const scenario = getActiveScenario();

    if (stepIndex >= scenario.steps.length) {
      useStore.getState().actions.pause();
      return;
    }

    const nextStep = scenario.steps[stepIndex];
    const wait = Math.max(1, Math.round(nextStep.ms / speed));

    timeoutRef.current = setTimeout(() => {
      useStore.getState().actions.step();
    }, wait);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [playing, stepIndex, speed, scenarioId]);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm run test:run -- src/engine/__tests__/scheduler.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add src/engine/scheduler.ts src/engine/__tests__/scheduler.test.ts && git commit -m "$(cat <<'EOF'
feat(engine): scheduler hook with speed + auto-pause at end

Tests use vi.useFakeTimers to verify tick durations deterministically.
Scheduler clears its timeout on every dep change so speed/scenario
swap don't leak orphan timers. Auto-pauses when stepIndex reaches
steps.length.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: FlowCanvas + StageNode (static diagram)

**Files:**
- Create: `src/components/Flow/FlowCanvas.tsx`, `src/components/Flow/StageNode.tsx`
- Modify: `src/App.tsx` (render FlowCanvas to see it)

- [ ] **Step 1: Create `StageNode.tsx`**

Create `C:/Dev/Demo Workshop/src/components/Flow/StageNode.tsx`:
```tsx
import { Handle, Position, type NodeProps } from '@xyflow/react';
import clsx from 'clsx';
import type { Stage } from '../../scenarios/types';

export type StageNodeData = {
  label: string;
  stage: Stage;
  conditional?: boolean;
  isActive?: boolean;   // set by FlowCanvas when token has arrived
};

const STAGE_BG: Record<Stage, string> = {
  source:        'bg-stage-source',
  cleaning:      'bg-stage-cleaning',
  consolidation: 'bg-stage-consolidation',
  upload:        'bg-stage-upload',
};

export default function StageNode({ data }: NodeProps<StageNodeData>) {
  return (
    <div
      className={clsx(
        'w-44 h-20 rounded-lg shadow-sm border px-3 py-2 text-sm font-body leading-snug text-text-strong',
        STAGE_BG[data.stage],
        data.isActive && 'ring-2 ring-brand-primary scale-[1.04] transition-transform',
        data.conditional && !data.isActive && 'animate-pulse',
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
    </div>
  );
}
```

- [ ] **Step 2: Create `FlowCanvas.tsx`**

Create `C:/Dev/Demo Workshop/src/components/Flow/FlowCanvas.tsx`:
```tsx
import { useMemo } from 'react';
import { ReactFlow, Background, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { pipelineNodes, pipelineEdges } from '../../scenarios/pipeline';
import StageNode, { type StageNodeData } from './StageNode';
import { useStore, getActiveScenario } from '../../engine/store';

const nodeTypes = { stage: StageNode };

export default function FlowCanvas() {
  const stepIndex = useStore(s => s.stepIndex);
  const activeScenarioId = useStore(s => s.activeScenario);

  const activeNodeId = useMemo(() => {
    const scenario = getActiveScenario();
    if (stepIndex === 0) return null;
    return scenario.steps[stepIndex - 1]?.to ?? null;
  }, [stepIndex, activeScenarioId]);

  const nodes: Node<StageNodeData>[] = useMemo(
    () => pipelineNodes.map(n => ({
      id: String(n.id),
      type: 'stage',
      position: n.position,
      draggable: false,
      selectable: false,
      data: {
        label: n.label,
        stage: n.stage,
        conditional: n.conditional,
        isActive: activeNodeId === n.id,
      },
    })),
    [activeNodeId]
  );

  const edges: Edge[] = useMemo(
    () => pipelineEdges.map(e => ({
      id: e.id,
      source: String(e.from),
      target: String(e.to),
      type: 'smoothstep',
      style: { stroke: 'var(--edge-idle, #c2c7cc)', strokeWidth: 2 },
    })),
    []
  );

  return (
    <div className="w-full h-[calc(100vh-60px)] bg-surface">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} />
      </ReactFlow>
    </div>
  );
}
```

- [ ] **Step 3: Update `App.tsx` to render the canvas**

Replace `C:/Dev/Demo Workshop/src/App.tsx`:
```tsx
import FlowCanvas from './components/Flow/FlowCanvas';

export default function App() {
  return (
    <div className="min-h-screen bg-surface font-body text-text-strong">
      <header className="h-[60px] flex items-center px-6 border-b border-text-muted/20">
        <h1 className="font-heading text-lg text-brand-primary">CMS ETL Walkthrough</h1>
      </header>
      <FlowCanvas />
    </div>
  );
}
```

- [ ] **Step 4: Visual verification**

Run `npm run dev`. Open `http://localhost:5173/`. You should see: a header bar with the title, then the 13 nodes laid out left-to-right with stage-band colors, node 10 hanging below, and curved edges connecting them. Ctrl+C.

- [ ] **Step 5: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add src/components/Flow/FlowCanvas.tsx src/components/Flow/StageNode.tsx src/App.tsx && git commit -m "$(cat <<'EOF'
feat(flow): render static pipeline with stage nodes

React Flow with a custom stage node type. Nodes are non-draggable and
non-selectable (this is a presentation, not an editor). Active state
is derived from store.stepIndex so the current node auto-highlights.
No token animation yet — that's the next task.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Token Component

**Files:**
- Create: `src/components/Flow/Token.tsx`
- Modify: `src/components/Flow/FlowCanvas.tsx` (render Token + hook useScheduler)

- [ ] **Step 1: Create `Token.tsx`**

Create `C:/Dev/Demo Workshop/src/components/Flow/Token.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import { useStore, getActiveScenario } from '../../engine/store';
import { getNode } from '../../scenarios/pipeline';

/** A straight-line interpolation is enough — React Flow renders curved edges,
 *  but for the token we just need a visually smooth motion between node centers. */
function interpolate(
  from: { x: number; y: number },
  to: { x: number; y: number },
  t: number
) {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}

/** Node width 176 (w-44), height 80 (h-20) — center offset. */
const CENTER = { x: 88, y: 40 };

export default function Token() {
  const playing    = useStore(s => s.playing);
  const speed      = useStore(s => s.speed);
  const stepIndex  = useStore(s => s.stepIndex);
  const scenarioId = useStore(s => s.activeScenario);

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (stepIndex === 0) {
      setPos(null);
      return;
    }
    const scenario = getActiveScenario();
    const step = scenario.steps[stepIndex - 1];
    if (!step) return;

    const toNode = getNode(step.to);
    const fromNode = step.from === null || step.from === step.to ? toNode : getNode(step.from);

    const start = performance.now();
    const duration = playing ? Math.max(1, step.ms / speed) : 1;

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      setPos(interpolate(
        { x: fromNode.position.x + CENTER.x, y: fromNode.position.y + CENTER.y },
        { x: toNode.position.x   + CENTER.x, y: toNode.position.y   + CENTER.y },
        t
      ));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stepIndex, playing, speed, scenarioId]);

  if (!pos) return null;

  return (
    <div
      className="pointer-events-none absolute w-4 h-4 rounded-full bg-token-fill shadow-md z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: pos.x, top: pos.y }}
    />
  );
}
```

- [ ] **Step 2: Modify `FlowCanvas.tsx` to include Token + scheduler**

Replace `C:/Dev/Demo Workshop/src/components/Flow/FlowCanvas.tsx`:
```tsx
import { useMemo } from 'react';
import { ReactFlow, Background, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { pipelineNodes, pipelineEdges } from '../../scenarios/pipeline';
import StageNode, { type StageNodeData } from './StageNode';
import Token from './Token';
import { useStore, getActiveScenario } from '../../engine/store';
import { useScheduler } from '../../engine/scheduler';

const nodeTypes = { stage: StageNode };

export default function FlowCanvas() {
  useScheduler();

  const stepIndex = useStore(s => s.stepIndex);
  const activeScenarioId = useStore(s => s.activeScenario);

  const activeNodeId = useMemo(() => {
    const scenario = getActiveScenario();
    if (stepIndex === 0) return null;
    return scenario.steps[stepIndex - 1]?.to ?? null;
  }, [stepIndex, activeScenarioId]);

  const nodes: Node<StageNodeData>[] = useMemo(
    () => pipelineNodes.map(n => ({
      id: String(n.id),
      type: 'stage',
      position: n.position,
      draggable: false,
      selectable: false,
      data: {
        label: n.label,
        stage: n.stage,
        conditional: n.conditional,
        isActive: activeNodeId === n.id,
      },
    })),
    [activeNodeId]
  );

  const edges: Edge[] = useMemo(
    () => pipelineEdges.map(e => ({
      id: e.id,
      source: String(e.from),
      target: String(e.to),
      type: 'smoothstep',
      style: { stroke: '#c2c7cc', strokeWidth: 2 },
    })),
    []
  );

  return (
    <div className="relative w-full h-[calc(100vh-60px)] bg-surface">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} />
      </ReactFlow>
      <Token />
    </div>
  );
}
```

- [ ] **Step 3: Temporary visual test — drive the store from a dev button**

Temporarily add a floating "Step" button in `src/App.tsx` so you can click through and see the token move. (Removed in Task 16 when PlaybackControls ships.)

Replace `C:/Dev/Demo Workshop/src/App.tsx`:
```tsx
import FlowCanvas from './components/Flow/FlowCanvas';
import { useStore } from './engine/store';

export default function App() {
  const actions = useStore(s => s.actions);
  return (
    <div className="min-h-screen bg-surface font-body text-text-strong">
      <header className="h-[60px] flex items-center px-6 border-b border-text-muted/20 gap-4">
        <h1 className="font-heading text-lg text-brand-primary">CMS ETL Walkthrough</h1>
        <button onClick={actions.step} className="px-3 py-1 border rounded">Step</button>
        <button onClick={actions.reset} className="px-3 py-1 border rounded">Reset</button>
        <button onClick={actions.play} className="px-3 py-1 border rounded">Play</button>
        <button onClick={actions.pause} className="px-3 py-1 border rounded">Pause</button>
      </header>
      <FlowCanvas />
    </div>
  );
}
```

- [ ] **Step 4: Visual verification**

Run `npm run dev`. Click **Step** a few times — the token should pop into view at node 1 and move to each next node on each click. Click **Play** — token should traverse the pipeline automatically, auto-pause at node 13. Ctrl+C.

- [ ] **Step 5: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add src/components/Flow/Token.tsx src/components/Flow/FlowCanvas.tsx src/App.tsx && git commit -m "$(cat <<'EOF'
feat(flow): animated token riding edges + scheduler wired

Token position is rAF-interpolated between node centers. Linear motion
is close enough visually — React Flow draws curved edges but the dot
doesn't need to exactly follow the curve. Scheduler plugged into
FlowCanvas so play-mode auto-advances.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Tooltip Component

**Files:**
- Create: `src/components/Flow/Tooltip.tsx`
- Modify: `src/components/Flow/FlowCanvas.tsx` (render Tooltip)

- [ ] **Step 1: Create `Tooltip.tsx`**

Create `C:/Dev/Demo Workshop/src/components/Flow/Tooltip.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import { useStore, getActiveScenario } from '../../engine/store';
import { getNode } from '../../scenarios/pipeline';

const FADE_DELAY_MS = 3000;

export default function Tooltip() {
  const stepIndex = useStore(s => s.stepIndex);
  const playing   = useStore(s => s.playing);

  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = stepIndex === 0 ? null : getActiveScenario().steps[stepIndex - 1];

  useEffect(() => {
    if (!step) {
      setVisible(false);
      return;
    }
    setVisible(true);

    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    // Only auto-fade while playing; on pause or hover the tooltip persists.
    if (playing && !hovered) {
      fadeTimerRef.current = setTimeout(() => setVisible(false), FADE_DELAY_MS);
    }
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [stepIndex, playing, hovered, step]);

  if (!step || !visible) return null;

  const toNode = getNode(step.to);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="absolute z-20 max-w-[320px] px-3 py-2 rounded-md bg-white shadow-lg border border-text-muted/20 text-sm text-text-strong transition-opacity"
      style={{
        left: toNode.position.x + 88,  // node center X
        top:  toNode.position.y - 12,  // just above the node
        transform: 'translate(-50%, -100%)',
      }}
    >
      {step.tooltip}
    </div>
  );
}
```

- [ ] **Step 2: Render Tooltip in `FlowCanvas.tsx`**

In `C:/Dev/Demo Workshop/src/components/Flow/FlowCanvas.tsx`, import and render Tooltip just after `<Token />`:
```tsx
import Tooltip from './Tooltip';
// …
      <Token />
      <Tooltip />
```

- [ ] **Step 3: Visual verification**

Run `npm run dev`. Click Step — a tooltip should appear above the active node with the step's text. Click Play — tooltip appears, fades after ~3s while the token moves on. Hover the tooltip while paused — it should persist. Ctrl+C.

- [ ] **Step 4: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add src/components/Flow/Tooltip.tsx src/components/Flow/FlowCanvas.tsx && git commit -m "$(cat <<'EOF'
feat(flow): tooltip with fade-on-arrival + persist-on-hover/pause

3-second fade while playing, stays pinned when paused or when the
cursor is over the tooltip itself. Positioned above the active node
by reading the node center from pipeline.ts (single source of truth
for positions).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Header, BrandLogo, ScenarioToggle

**Files:**
- Create: `src/components/Header/Header.tsx`, `src/components/Header/BrandLogo.tsx`, `src/components/Header/ScenarioToggle.tsx`
- Create: `src/components/Header/__tests__/ScenarioToggle.test.tsx`
- Modify: `src/App.tsx` (use Header)

- [ ] **Step 1: Create `BrandLogo.tsx`**

Create `C:/Dev/Demo Workshop/src/components/Header/BrandLogo.tsx`:
```tsx
export default function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* If alstom-logo.svg was extracted into /public in Task 4, swap for an <img>. */}
      <div className="w-6 h-6 rounded-full bg-brand-primary" aria-hidden />
      <span className="font-heading text-base text-brand-primary">CMS ETL Walkthrough</span>
    </div>
  );
}
```

- [ ] **Step 2: Create `ScenarioToggle.tsx`**

Create `C:/Dev/Demo Workshop/src/components/Header/ScenarioToggle.tsx`:
```tsx
import clsx from 'clsx';
import { useStore } from '../../engine/store';

const TABS: Array<{ id: 'standard' | 'overtime'; label: string }> = [
  { id: 'standard', label: 'Standard' },
  { id: 'overtime', label: 'Overtime' },
];

export default function ScenarioToggle() {
  const active  = useStore(s => s.activeScenario);
  const setScenario = useStore(s => s.actions.setScenario);

  return (
    <div className="inline-flex rounded-full border border-text-muted/30 p-0.5" role="tablist" aria-label="Scenario">
      {TABS.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => setScenario(tab.id)}
          className={clsx(
            'px-4 py-1 text-sm rounded-full transition-colors',
            active === tab.id
              ? 'bg-brand-primary text-white'
              : 'text-text-strong hover:bg-text-muted/10'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write ScenarioToggle smoke test**

Create `C:/Dev/Demo Workshop/src/components/Header/__tests__/ScenarioToggle.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach } from 'vitest';
import ScenarioToggle from '../ScenarioToggle';
import { useStore } from '../../../engine/store';

beforeEach(() => {
  useStore.getState().actions.reset();
  useStore.setState({ activeScenario: 'standard' });
});

describe('<ScenarioToggle />', () => {
  it('renders both tabs with the correct initial selection', () => {
    render(<ScenarioToggle />);
    expect(screen.getByRole('tab', { name: 'Standard' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Overtime' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls setScenario when the other tab is clicked', async () => {
    render(<ScenarioToggle />);
    await userEvent.click(screen.getByRole('tab', { name: 'Overtime' }));
    expect(useStore.getState().activeScenario).toBe('overtime');
  });
});
```

- [ ] **Step 4: Run test**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm run test:run -- src/components/Header
```

Expected: all tests pass.

- [ ] **Step 5: Create `Header.tsx`**

Create `C:/Dev/Demo Workshop/src/components/Header/Header.tsx`:
```tsx
import BrandLogo from './BrandLogo';
import ScenarioToggle from './ScenarioToggle';
import PlaybackControls from '../PlaybackControls/PlaybackControls';

export default function Header() {
  return (
    <header className="h-[60px] flex items-center justify-between px-6 border-b border-text-muted/20 bg-surface">
      <BrandLogo />
      <ScenarioToggle />
      <PlaybackControls />
    </header>
  );
}
```

This imports `PlaybackControls` which doesn't exist yet — intentional, it's built in Task 16. Typescript will error until Task 16 completes. To keep this task shippable in isolation, stub the import for now.

- [ ] **Step 6: Stub `PlaybackControls` so Header compiles now**

Create `C:/Dev/Demo Workshop/src/components/PlaybackControls/PlaybackControls.tsx`:
```tsx
// Stub — replaced with real controls in Task 16.
export default function PlaybackControls() {
  return <div className="text-text-muted text-sm">[playback controls]</div>;
}
```

- [ ] **Step 7: Replace App.tsx header with the new Header**

Replace `C:/Dev/Demo Workshop/src/App.tsx`:
```tsx
import Header from './components/Header/Header';
import FlowCanvas from './components/Flow/FlowCanvas';

export default function App() {
  return (
    <div className="min-h-screen bg-surface font-body text-text-strong">
      <Header />
      <FlowCanvas />
    </div>
  );
}
```

- [ ] **Step 8: Visual verification**

Run `npm run dev`. Header now has brand logo, scenario toggle center, playback-controls stub right. Click **Overtime** tab — scenario swaps, state resets, node 10 should eventually be visited when you step through. Ctrl+C.

- [ ] **Step 9: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add src/components/Header/ src/components/PlaybackControls/PlaybackControls.tsx src/App.tsx && git commit -m "$(cat <<'EOF'
feat(header): brand logo + scenario toggle + header layout

Toggle uses role=tablist with aria-selected for accessibility.
Switching scenarios resets stepIndex + laborRow (via store action).
PlaybackControls stubbed for now; real one in Task 16.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 16: PlaybackControls

**Files:**
- Replace: `src/components/PlaybackControls/PlaybackControls.tsx`
- Create: `src/components/PlaybackControls/__tests__/PlaybackControls.test.tsx`

- [ ] **Step 1: Write PlaybackControls test**

Create `C:/Dev/Demo Workshop/src/components/PlaybackControls/__tests__/PlaybackControls.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach } from 'vitest';
import PlaybackControls from '../PlaybackControls';
import { useStore } from '../../../engine/store';

beforeEach(() => {
  useStore.getState().actions.reset();
});

describe('<PlaybackControls />', () => {
  it('starts showing Play (not Pause)', () => {
    render(<PlaybackControls />);
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });

  it('toggles to Pause after clicking Play', async () => {
    render(<PlaybackControls />);
    await userEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(useStore.getState().playing).toBe(true);
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('advances stepIndex when Step is clicked', async () => {
    render(<PlaybackControls />);
    await userEvent.click(screen.getByRole('button', { name: /step forward/i }));
    expect(useStore.getState().stepIndex).toBe(1);
  });

  it('rewinds stepIndex when Step Back is clicked', async () => {
    useStore.getState().actions.step();
    useStore.getState().actions.step();
    render(<PlaybackControls />);
    await userEvent.click(screen.getByRole('button', { name: /step back/i }));
    expect(useStore.getState().stepIndex).toBe(1);
  });

  it('resets when Reset is clicked', async () => {
    useStore.getState().actions.step();
    render(<PlaybackControls />);
    await userEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(useStore.getState().stepIndex).toBe(0);
  });

  it('changes speed via the slider', () => {
    render(<PlaybackControls />);
    const slider = screen.getByRole('slider', { name: /speed/i });
    fireEvent.change(slider, { target: { value: '2' } });
    expect(useStore.getState().speed).toBe(2);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm run test:run -- src/components/PlaybackControls
```

Expected: FAIL (stub has no buttons).

- [ ] **Step 3: Implement PlaybackControls**

Replace `C:/Dev/Demo Workshop/src/components/PlaybackControls/PlaybackControls.tsx`:
```tsx
import { useStore } from '../../engine/store';

export default function PlaybackControls() {
  const playing = useStore(s => s.playing);
  const speed   = useStore(s => s.speed);
  const { play, pause, step, stepBack, reset, setSpeed } = useStore(s => s.actions);

  return (
    <div className="flex items-center gap-2">
      <button
        aria-label="Step back"
        onClick={stepBack}
        className="px-2 py-1 rounded border border-text-muted/30 hover:bg-text-muted/10"
      >◀◀</button>

      {playing ? (
        <button
          aria-label="Pause"
          onClick={pause}
          className="px-3 py-1 rounded bg-brand-primary text-white"
        >⏸ Pause</button>
      ) : (
        <button
          aria-label="Play"
          onClick={play}
          className="px-3 py-1 rounded bg-brand-primary text-white"
        >▶ Play</button>
      )}

      <button
        aria-label="Step forward"
        onClick={step}
        className="px-2 py-1 rounded border border-text-muted/30 hover:bg-text-muted/10"
      >▶▶</button>

      <button
        aria-label="Reset"
        onClick={reset}
        className="px-2 py-1 rounded border border-text-muted/30 hover:bg-text-muted/10"
      >↻</button>

      <label className="flex items-center gap-1 ml-2 text-xs text-text-muted">
        <span>Speed</span>
        <input
          type="range"
          aria-label="Speed"
          min={0.5}
          max={2}
          step={0.5}
          value={speed}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v === 0.5 || v === 1 || v === 2) setSpeed(v);
          }}
        />
        <span className="w-8 text-right">{speed}×</span>
      </label>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm run test:run -- src/components/PlaybackControls
```

Expected: all tests pass.

- [ ] **Step 5: Visual verification**

Run `npm run dev`. Header right now has working controls: Play/Pause/Step/Step-back/Reset/Speed slider. Verify all behave correctly. Ctrl+C.

- [ ] **Step 6: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add src/components/PlaybackControls/ && git commit -m "$(cat <<'EOF'
feat(controls): play/pause/step/stepback/reset + speed slider

aria-labeled buttons, slider accepts {0.5, 1, 2}. Play button swaps
to Pause while playing. All wired to store actions.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 17: Legend + Glossary Chips

**Files:**
- Create: `src/scenarios/glossary.ts`
- Create: `src/components/Flow/Legend.tsx`
- Create: `src/components/Glossary/GlossaryChip.tsx`, `src/components/Glossary/__tests__/GlossaryChip.test.tsx`
- Modify: `src/components/Flow/FlowCanvas.tsx` (render Legend)
- Modify: `src/components/Header/Header.tsx` (add GlossaryChip)

- [ ] **Step 1: Create `glossary.ts`**

Create `C:/Dev/Demo Workshop/src/scenarios/glossary.ts`:
```ts
export type GlossaryEntry = { term: string; definition: string };

export const glossary: GlossaryEntry[] = [
  { term: 'AFP', definition: 'Application For Payment — the monthly billing package the team prepares.' },
  { term: 'Cost-management system (CMS)', definition: "Metrolinx's system we upload our costs into." },
  { term: 'Cost category', definition: 'The cost-category hierarchy the cost-management system organizes costs under.' },
  { term: 'Catchup hours', definition: 'Overtime hours redistributed proportionally back across the employee\'s projects.' },
  { term: 'Billable maximum', definition: 'The maximum hours an employee can bill to projects in a given month (location- and month-dependent).' },
  { term: 'Loaded cost', definition: "The employee's cost including overhead/benefit loadings on top of the base hourly rate." },
  { term: 'Project code', definition: 'The unique code identifying which project a cost is charged to (sometimes called the "WBS element").' },
];
```

- [ ] **Step 2: Create `GlossaryChip.tsx`**

Create `C:/Dev/Demo Workshop/src/components/Glossary/GlossaryChip.tsx`:
```tsx
import { useState } from 'react';
import { glossary } from '../../scenarios/glossary';

export default function GlossaryChip() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="text-sm px-3 py-1 rounded-full border border-text-muted/30 hover:bg-text-muted/10"
      >
        Glossary
      </button>
      {open && (
        <div role="dialog" aria-label="Glossary" className="absolute right-0 top-full mt-2 w-80 max-h-[60vh] overflow-auto rounded-md bg-white shadow-xl border border-text-muted/20 p-3 z-30">
          <dl className="text-sm space-y-2">
            {glossary.map(g => (
              <div key={g.term}>
                <dt className="font-semibold text-text-strong">{g.term}</dt>
                <dd className="text-text-muted">{g.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write GlossaryChip test**

Create `C:/Dev/Demo Workshop/src/components/Glossary/__tests__/GlossaryChip.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlossaryChip from '../GlossaryChip';

describe('<GlossaryChip />', () => {
  it('is closed by default', () => {
    render(<GlossaryChip />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on click and shows glossary entries', async () => {
    render(<GlossaryChip />);
    await userEvent.click(screen.getByRole('button', { name: /glossary/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Application For Payment/i)).toBeInTheDocument();
  });

  it('closes on second click', async () => {
    render(<GlossaryChip />);
    const btn = screen.getByRole('button', { name: /glossary/i });
    await userEvent.click(btn);
    await userEvent.click(btn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm run test:run -- src/components/Glossary
```

Expected: all pass.

- [ ] **Step 4: Add GlossaryChip to Header**

Replace `C:/Dev/Demo Workshop/src/components/Header/Header.tsx`:
```tsx
import BrandLogo from './BrandLogo';
import ScenarioToggle from './ScenarioToggle';
import PlaybackControls from '../PlaybackControls/PlaybackControls';
import GlossaryChip from '../Glossary/GlossaryChip';

export default function Header() {
  return (
    <header className="h-[60px] flex items-center justify-between px-6 border-b border-text-muted/20 bg-surface">
      <BrandLogo />
      <ScenarioToggle />
      <div className="flex items-center gap-3">
        <PlaybackControls />
        <GlossaryChip />
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Create `Legend.tsx`**

Create `C:/Dev/Demo Workshop/src/components/Flow/Legend.tsx`:
```tsx
import { useState } from 'react';

const ITEMS: Array<{ color: string; label: string }> = [
  { color: 'bg-stage-source',        label: 'Source' },
  { color: 'bg-stage-cleaning',      label: 'Cleaning' },
  { color: 'bg-stage-consolidation', label: 'Consolidation' },
  { color: 'bg-stage-upload',        label: 'Upload' },
];

export default function Legend() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 bg-white/90 backdrop-blur px-3 py-2 rounded-md shadow border border-text-muted/20 text-xs">
      {ITEMS.map(i => (
        <div key={i.label} className="flex items-center gap-1">
          <span className={`${i.color} w-3 h-3 rounded-sm inline-block`} />
          <span>{i.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1 ml-2 pl-2 border-l border-text-muted/20">
        <span className="w-3 h-3 rounded-full bg-token-fill inline-block" />
        <span>Data point</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 text-text-muted hover:text-text-strong"
        aria-label="Dismiss legend"
      >×</button>
    </div>
  );
}
```

- [ ] **Step 6: Render Legend in FlowCanvas**

In `C:/Dev/Demo Workshop/src/components/Flow/FlowCanvas.tsx`, add Legend next to Token/Tooltip:
```tsx
import Legend from './Legend';
// inside the returned JSX after <Tooltip />
      <Tooltip />
      <Legend />
```

- [ ] **Step 7: Visual verification**

Run `npm run dev`. Legend should appear bottom-left with stage colors + token dot, and dismiss with ×. Glossary chip top-right should open a panel with term definitions. Ctrl+C.

- [ ] **Step 8: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add src/scenarios/glossary.ts src/components/Glossary/ src/components/Flow/Legend.tsx src/components/Flow/FlowCanvas.tsx src/components/Header/Header.tsx && git commit -m "$(cat <<'EOF'
feat: legend + glossary chips

Legend bottom-left (dismissible) names the four stage colors + the
token. Glossary chip top-right opens a scrollable panel of plain-
English definitions for every acronym used anywhere in the app.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 18: Integration Smoke Test + Final Polish

**Files:**
- Create: `src/__tests__/integration.test.tsx`

- [ ] **Step 1: Write a full-flow integration test**

Create `C:/Dev/Demo Workshop/src/__tests__/integration.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';
import App from '../App';
import { useStore } from '../engine/store';
import { standardScenario } from '../scenarios/standard';
import { overtimeScenario } from '../scenarios/overtime';

beforeEach(() => {
  vi.useFakeTimers();
  useStore.getState().actions.reset();
  useStore.setState({ activeScenario: 'standard' });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('App — integration', () => {
  it('plays the standard scenario end-to-end and auto-pauses at node 13', async () => {
    render(<App />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole('button', { name: /play/i }));
    vi.advanceTimersByTime(30_000);

    const s = useStore.getState();
    expect(s.stepIndex).toBe(standardScenario.steps.length);
    expect(s.playing).toBe(false);
    expect(s.laborRow.loadedCost).toBe(15000);
  });

  it('switching to overtime resets and eventually visits node 10', async () => {
    render(<App />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole('tab', { name: 'Overtime' }));
    expect(useStore.getState().activeScenario).toBe('overtime');
    expect(useStore.getState().stepIndex).toBe(0);

    await user.click(screen.getByRole('button', { name: /play/i }));
    vi.advanceTimersByTime(30_000);

    const s = useStore.getState();
    expect(s.stepIndex).toBe(overtimeScenario.steps.length);
    expect(s.laborRow.catchupByProject).toEqual([
      { projectCode: 'TOR-ITB-015-EL', hours: 16.8 },
      { projectCode: 'TOR-ITB-015-ME', hours: 11.2 },
    ]);
  });
});
```

- [ ] **Step 2: Run the full suite**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm run test:run
```

Expected: all tests pass across scenarios, store, scheduler, components, integration.

- [ ] **Step 3: Check coverage on engine + scenarios**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm run test:coverage -- src/engine src/scenarios
```

Expected: `src/engine/store.ts`, `src/engine/scheduler.ts`, `src/scenarios/pipeline.ts` all >90% line coverage. If anything falls below, add the missing test case before committing.

- [ ] **Step 4: Run the production build to catch type errors**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm run build
```

Expected: `dist/` folder generated, no TypeScript errors, no build warnings.

- [ ] **Step 5: Preview the production build**

Run:
```bash
cd "C:/Dev/Demo Workshop" && npm run preview
```

Open the printed URL. Smoke-test: play scenario 1 end-to-end, switch to scenario 2, play end-to-end. Close with Ctrl+C.

- [ ] **Step 6: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add src/__tests__/ && git commit -m "$(cat <<'EOF'
test: integration smoke for both scenarios end-to-end

Plays each scenario with fake timers, asserts final stepIndex, final
laborRow state (loadedCost for standard, catchupByProject for overtime),
and that playing auto-turns-off at the final step.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 19: README + DEPLOY.md

**Files:**
- Create: `README.md`, `DEPLOY.md`

- [ ] **Step 1: Create `README.md`**

Create `C:/Dev/Demo Workshop/README.md`:
```markdown
# CMS ETL Walkthrough

An interactive simulation of the GO Expansion CMS ETL pipeline — designed to explain in plain English how a single labor data point travels from a regional payroll system into the cost-management system.

Live: https://workshop.arbrass.ca

## Scenarios

1. **Standard Canada row** — a 48h labor row following the happy path.
2. **Overtime & redistribution** — the same employee logs 180h in November (28h overtime). Watch the excess get split back across projects.

## Dev

Requires Node 20 (see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest watch
npm run test:run   # one-shot
npm run build      # dist/
npm run preview    # serve dist/ locally
```

## Design

Design spec: [`docs/superpowers/specs/2026-04-16-etl-walkthrough-design.md`](docs/superpowers/specs/2026-04-16-etl-walkthrough-design.md).

## Deploy

See [`DEPLOY.md`](DEPLOY.md).
```

- [ ] **Step 2: Create `DEPLOY.md`**

Create `C:/Dev/Demo Workshop/DEPLOY.md`:
```markdown
# Deploy

This app is deployed as a static site to Cloudflare Pages at `workshop.arbrass.ca`.

## One-time Cloudflare setup

1. Open https://dash.cloudflare.com → **Workers & Pages** → **Start building** → **Pages** → **Connect to Git**.
2. Authorize GitHub when prompted. Pick the repo: `rthomassin/cms-etl-walkthrough`.
3. Configure build:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION=20`
4. **Save & Deploy**. The first build publishes to `https://<slug>.pages.dev`.

## Custom domain

1. Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter `workshop.arbrass.ca`.
3. Because `arbrass.ca` is already on Cloudflare DNS, the CNAME is created automatically. Propagation is usually < 1 minute.

## Every deploy

Push to `main`:

```bash
git push origin main
```

Cloudflare Pages automatically runs `npm run build` and publishes the result. Preview deploys run on feature branches.

## Rolling back

Pages project → **Deployments** → click any prior deployment → **Rollback to this deployment**.
```

- [ ] **Step 3: Commit**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git add README.md DEPLOY.md && git commit -m "$(cat <<'EOF'
docs: add README and DEPLOY instructions

README for local dev. DEPLOY.md covers the one-time Cloudflare Pages
setup, the workshop.arbrass.ca custom-domain connection, and how to
roll back a bad deploy.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 20: Create GitHub Repo and Push

**Files:** none

- [ ] **Step 1: Verify gh is authenticated as rthomassin**

Run:
```bash
gh auth status
```

Expected: `rthomassin` is listed and marked **Active account: true**. If not, switch:
```bash
gh auth switch --user rthomassin
```

- [ ] **Step 2: Create the GitHub repo**

Run:
```bash
cd "C:/Dev/Demo Workshop" && gh repo create rthomassin/cms-etl-walkthrough --public --description "Interactive CMS ETL walkthrough — workshop demo" --source=. --remote=origin
```

Expected: repo created, origin set.

- [ ] **Step 3: Push `main`**

Run:
```bash
cd "C:/Dev/Demo Workshop" && git push -u origin main
```

Expected: all commits pushed.

- [ ] **Step 4: Hand off to the user for Cloudflare setup**

Stop. Ask the user to follow `DEPLOY.md` steps 1–3 in their Cloudflare dashboard (this cannot be done for them). When they confirm the first deploy is green and `workshop.arbrass.ca` serves the app, the project is done.

---

## Self-Review Notes

Spec coverage checklist (run after writing the plan):

- ✅ Static React app on Cloudflare Pages (Tasks 1–3, 19, 20)
- ✅ Brand tokens from PPTX (Task 4)
- ✅ 13 nodes in 4 stages, plain-English labels (Task 6)
- ✅ Shared diagram, per-scenario step lists (Tasks 6, 7, 8)
- ✅ Scenario 1 skips node 10; Scenario 2 includes it (Tasks 7, 8, 9)
- ✅ Scenario toggle resets state (Tasks 10, 15)
- ✅ Playback controls: play/pause/step/stepBack/reset/speed (Tasks 10, 11, 16)
- ✅ Tooltip with fade-on-arrival + persist-on-hover/pause (Task 14)
- ✅ Legend + Glossary chips (Task 17)
- ✅ Desktop-only (`<meta viewport content="width=1280">`, Task 1)
- ✅ Custom domain workshop.arbrass.ca (Task 19 instructions, Task 20 push)
- ✅ Tests: engine TDD (Tasks 10, 11), scenario validation (Task 9), component smoke (Tasks 15, 16, 17), integration (Task 18)
- ✅ Coverage target >90% on engine + scenarios (Task 18 step 3)
