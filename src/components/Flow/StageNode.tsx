import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import clsx from 'clsx';
import type { Stage } from '../../scenarios/types';

export type StageNodeData = {
  label: string;
  stage: Stage;
  nodeNumber: number;
  conditional?: boolean;
  isSelected?: boolean;
  isInput?: boolean;    // predecessor of selected node
  isOutput?: boolean;   // successor of selected node
  isDimmed?: boolean;   // everything else when a node is selected
};

const STAGE_STROKE: Record<Stage, string> = {
  source:        'border-[#A58B4E]',
  cleaning:      'border-[#4A6A8A]',
  consolidation: 'border-brand-primary',
  upload:        'border-[#1E3A82]',
};

const STAGE_ACCENT: Record<Stage, string> = {
  source:        'bg-[#A58B4E]',
  cleaning:      'bg-[#4A6A8A]',
  consolidation: 'bg-brand-primary',
  upload:        'bg-[#1E3A82]',
};

export default function StageNode({ data }: NodeProps<Node<StageNodeData>>) {
  const { label, stage, nodeNumber, conditional, isSelected, isInput, isOutput, isDimmed } = data;

  return (
    <div
      className={clsx(
        'relative w-[156px] h-[96px] rounded-[6px] bg-paper transition-all duration-200 cursor-pointer',
        'border',
        STAGE_STROKE[stage],
        'shadow-paperSm',
        // State styling — precedence: selected > input/output > dimmed > default
        isSelected && 'shadow-active scale-[1.04] border-brand-primary border-2',
        isInput && !isSelected && 'ring-2 ring-[#78C86E] ring-offset-2 ring-offset-paper',
        isOutput && !isSelected && 'ring-2 ring-brand-secondary ring-offset-2 ring-offset-paper',
        isDimmed && !isSelected && !isInput && !isOutput && 'opacity-40',
        conditional && !isSelected && 'border-dashed',
      )}
    >
      {/* Stage accent bar along the top edge */}
      <div className={clsx('absolute top-0 left-0 right-0 h-[4px] rounded-t-[6px]', STAGE_ACCENT[stage])} />

      {/* Input / output flag at top-left */}
      {(isInput || isOutput) && !isSelected && (
        <div
          className={clsx(
            'absolute top-[8px] left-[10px] font-mono text-[9px] uppercase tracking-wide2 font-semibold',
            isInput ? 'text-[#3F8B4F]' : 'text-brand-secondary',
          )}
        >
          {isInput ? 'IN' : 'OUT'}
        </div>
      )}

      {/* Node number top-right */}
      <div className="absolute top-[8px] right-[10px] font-mono text-[10px] tracking-wide2 text-ink-faint tabular-nums">
        {String(nodeNumber).padStart(2, '0')}
      </div>

      {/* Main label */}
      <div className="absolute inset-0 pt-[22px] pb-[16px] px-[12px] flex items-center">
        <div
          className={clsx(
            'font-mono text-[12.5px] leading-[1.25] text-ink font-medium tracking-tight2',
            isSelected && 'font-semibold',
          )}
        >
          {label}
        </div>
      </div>

      {/* Conditional marker bottom-right */}
      {conditional && (
        <div className="absolute bottom-[6px] right-[10px] font-mono text-[9px] uppercase tracking-wide2 text-ink-faint">
          conditional
        </div>
      )}

      <Handle type="target" position={Position.Left}  className="!bg-transparent !border-0 !w-1 !h-1" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0 !w-1 !h-1" />
    </div>
  );
}
