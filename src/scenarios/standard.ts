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
