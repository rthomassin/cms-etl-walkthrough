import type { PipelineEdge, PipelineNode } from './types';

/**
 * 2-row horizontal layout, designed for a ~1080px-wide canvas (1440px viewport
 * minus the 320px context panel). Nodes are 156×96 with 20px gaps.
 *
 *   Row A (y=120):   1 → 2 → 3 → 4 → 5 → 6 → 7       (source + cleaning + 1st conso)
 *                                                  ↓
 *   Row B (y=360):   8 → 9 →──┬── 11 → 12 → 13      (consolidation + upload)
 *                             │
 *   Branch (y=520):          10                     (conditional — overtime)
 *
 * Connector 7 → 8 wraps right-down-left (smoothstep handles it cleanly).
 * Branch at node 9 splits between direct (9→11) and detour (9→10→11).
 */

const START_X = 40;
const GAP_X = 176;    // 156 node + 20 gap
const ROW_A_Y = 120;
const ROW_B_Y = 360;
const BRANCH_Y = 520;

function nodeX(index0: number) { return START_X + index0 * GAP_X; }

export const pipelineNodes: PipelineNode[] = [
  // Row A — nodes 1-7
  { id: 1,  label: 'Regional payroll',      stage: 'source',        position: { x: nodeX(0),  y: ROW_A_Y } },
  { id: 2,  label: 'Filter — this year',    stage: 'cleaning',      position: { x: nodeX(1),  y: ROW_A_Y } },
  { id: 3,  label: 'Filter — hours only',   stage: 'cleaning',      position: { x: nodeX(2),  y: ROW_A_Y } },
  { id: 4,  label: 'Merge regions',         stage: 'cleaning',      position: { x: nodeX(3),  y: ROW_A_Y } },
  { id: 5,  label: 'Extract employee ID',   stage: 'cleaning',      position: { x: nodeX(4),  y: ROW_A_Y } },
  { id: 6,  label: 'Match cost category',   stage: 'cleaning',      position: { x: nodeX(5),  y: ROW_A_Y } },
  { id: 7,  label: 'Join employee data',    stage: 'consolidation', position: { x: nodeX(6),  y: ROW_A_Y } },
  // Row B — nodes 8, 9, 11, 12, 13 (main row); node 10 branches below.
  { id: 8,  label: 'Sum monthly hours',     stage: 'consolidation', position: { x: nodeX(0),  y: ROW_B_Y } },
  { id: 9,  label: 'Check monthly max',     stage: 'consolidation', position: { x: nodeX(1),  y: ROW_B_Y } },
  { id: 10, label: 'Redistribute overtime', stage: 'consolidation', position: { x: nodeX(1),  y: BRANCH_Y }, conditional: true },
  { id: 11, label: 'Compute cost',          stage: 'consolidation', position: { x: nodeX(2),  y: ROW_B_Y } },
  { id: 12, label: 'Write consolidated',    stage: 'consolidation', position: { x: nodeX(3),  y: ROW_B_Y } },
  { id: 13, label: 'Upload to cost system', stage: 'upload',        position: { x: nodeX(4),  y: ROW_B_Y } },
];

/**
 * Edges include both branches at node 9:
 *   9 → 11 (direct)
 *   9 → 10 → 11 (overtime detour)
 */
export const pipelineEdges: PipelineEdge[] = [
  { id: '1-2',   from: 1,  to: 2  },
  { id: '2-3',   from: 2,  to: 3  },
  { id: '3-4',   from: 3,  to: 4  },
  { id: '4-5',   from: 4,  to: 5  },
  { id: '5-6',   from: 5,  to: 6  },
  { id: '6-7',   from: 6,  to: 7  },
  { id: '7-8',   from: 7,  to: 8  },   // row-wrap
  { id: '8-9',   from: 8,  to: 9  },
  { id: '9-11',  from: 9,  to: 11 },   // direct path
  { id: '9-10',  from: 9,  to: 10 },   // detour
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

/** Node dimensions used by the token math + renderer. Kept in one place. */
export const NODE_WIDTH = 156;
export const NODE_HEIGHT = 96;

export const STAGE_LABELS: Record<'source' | 'cleaning' | 'consolidation' | 'upload', string> = {
  source:        'SOURCE',
  cleaning:      'CLEANING',
  consolidation: 'CONSOLIDATION',
  upload:        'UPLOAD',
};

/** Min/max of the node positions for a stage — used to draw stage bands. */
export function stageBounds(stage: 'source' | 'cleaning' | 'consolidation' | 'upload') {
  const nodes = pipelineNodes.filter(n => n.stage === stage);
  if (nodes.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  const xs = nodes.map(n => n.position.x);
  const ys = nodes.map(n => n.position.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs) + NODE_WIDTH,
    minY: Math.min(...ys),
    maxY: Math.max(...ys) + NODE_HEIGHT,
  };
}
