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
