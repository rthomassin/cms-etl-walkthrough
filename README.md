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
