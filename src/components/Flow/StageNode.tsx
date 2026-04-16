import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
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

export default function StageNode({ data }: NodeProps<Node<StageNodeData>>) {
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
