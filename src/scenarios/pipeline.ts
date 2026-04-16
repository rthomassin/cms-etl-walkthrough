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
