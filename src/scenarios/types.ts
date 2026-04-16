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
