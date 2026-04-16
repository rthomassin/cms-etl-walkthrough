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
