import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import clsx from 'clsx';
import type { Stage } from '../../scenarios/types';

export type StageNodeData = {
  label: string;
  stage: Stage;
  nodeNumber: number;
  conditional?: boolean;
  isActive?: boolean;
};

/** Ink-stroke colour per stage: earthy for source, slate for cleaning,
 *  brand-blue for consolidation (the workhorse), deeper blue for upload. */
const STAGE_STROKE: Record<Stage, string> = {
  source:        'border-[#A58B4E]',
  cleaning:      'border-[#4A6A8A]',
  consolidation: 'border-[#2850F0]',
  upload:        'border-[#1E3A82]',
};

const STAGE_ACCENT: Record<Stage, string> = {
  source:        'bg-[#A58B4E]',
  cleaning:      'bg-[#4A6A8A]',
  consolidation: 'bg-brand-primary',
  upload:        'bg-[#1E3A82]',
};

export default function StageNode({ data }: NodeProps<Node<StageNodeData>>) {
  const { label, stage, nodeNumber, conditional, isActive } = data;

  return (
    <div
      className={clsx(
        'relative w-[156px] h-[96px] rounded-[6px] bg-paper transition-all duration-200',
        'border',
        STAGE_STROKE[stage],
        'shadow-paperSm',
        isActive && 'shadow-active breathe',
        conditional && !isActive && 'border-dashed opacity-85',
      )}
    >
      {/* Stage accent bar along the top edge */}
      <div className={clsx('absolute top-0 left-0 right-0 h-[4px] rounded-t-[6px]', STAGE_ACCENT[stage])} />

      {/* Node number — mono, subtle */}
      <div className="absolute top-[8px] right-[10px] font-mono text-[10px] tracking-wide2 text-ink-faint tabular-nums">
        {String(nodeNumber).padStart(2, '0')}
      </div>

      {/* Main label — mono, 2-line max */}
      <div className="absolute inset-0 pt-[22px] pb-[16px] px-[12px] flex items-center">
        <div className="font-mono text-[12.5px] leading-[1.25] text-ink font-medium tracking-tight2">
          {label}
        </div>
      </div>

      {/* Conditional marker — tiny badge bottom-right */}
      {conditional && (
        <div className="absolute bottom-[6px] right-[10px] font-mono text-[9px] uppercase tracking-wide2 text-ink-faint">
          conditional
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        className="!bg-transparent !border-0 !w-1 !h-1"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-transparent !border-0 !w-1 !h-1"
      />
    </div>
  );
}
