import { useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  pipelineNodes,
  pipelineEdges,
  NODE_WIDTH,
  NODE_HEIGHT,
  STAGE_LABELS,
} from '../../scenarios/pipeline';
import type { Stage } from '../../scenarios/types';
import StageNode, { type StageNodeData } from './StageNode';
import Token from './Token';
import { useStore, getActiveScenario } from '../../engine/store';
import { useScheduler } from '../../engine/scheduler';

const nodeTypes = { stage: StageNode };

/** Small horizontal stage-legend strip pinned above the canvas. Shows the
 *  four stages in order — each with a dot in its accent color. Node top-
 *  accent bars encode the same color, so the legend ties them together. */
const STAGE_ORDER: Stage[] = ['source', 'cleaning', 'consolidation', 'upload'];
const STAGE_DOT: Record<Stage, string> = {
  source:        'bg-[#A58B4E]',
  cleaning:      'bg-[#4A6A8A]',
  consolidation: 'bg-brand-primary',
  upload:        'bg-[#1E3A82]',
};

function StageLegend() {
  return (
    <div className="absolute top-3 left-6 z-10 flex items-center gap-3 px-3 py-1.5 rounded-full bg-paper/85 backdrop-blur-sm border border-paper-rule">
      <span className="font-mono text-[9.5px] tracking-wide3 text-ink-faint uppercase">Stages</span>
      <span className="text-paper-rule">·</span>
      {STAGE_ORDER.map((stage, i) => (
        <div key={stage} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-paper-rule mr-1">→</span>}
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${STAGE_DOT[stage]}`} />
          <span className="font-mono text-[10px] tracking-wide2 text-ink">
            {STAGE_LABELS[stage]}
          </span>
        </div>
      ))}
    </div>
  );
}

function CanvasInner() {
  useScheduler();

  const stepIndex = useStore(s => s.stepIndex);
  const activeScenarioId = useStore(s => s.activeScenario);

  const activeNodeId = useMemo(() => {
    const scenario = getActiveScenario();
    if (stepIndex === 0) return null;
    return scenario.steps[stepIndex - 1]?.to ?? null;
  }, [stepIndex, activeScenarioId]);

  const visitedEdgeId = useMemo(() => {
    if (stepIndex === 0) return null;
    const scenario = getActiveScenario();
    const step = scenario.steps[stepIndex - 1];
    if (!step || step.from === null || step.from === step.to) return null;
    return `${step.from}-${step.to}`;
  }, [stepIndex, activeScenarioId]);

  const nodes: Node<StageNodeData>[] = useMemo(
    () => pipelineNodes.map(n => ({
      id: String(n.id),
      type: 'stage',
      position: n.position,
      draggable: false,
      selectable: false,
      data: {
        label: n.label,
        stage: n.stage,
        nodeNumber: n.id,
        conditional: n.conditional,
        isActive: activeNodeId === n.id,
      },
    })),
    [activeNodeId]
  );

  const edges: Edge[] = useMemo(
    () => pipelineEdges.map(e => {
      const isActive = visitedEdgeId === e.id;
      const isConditional = e.id === '9-10' || e.id === '10-11';
      return {
        id: e.id,
        source: String(e.from),
        target: String(e.to),
        type: 'smoothstep',
        animated: isActive,
        style: {
          stroke: isActive ? '#2850F0' : '#B5A98F',
          strokeWidth: isActive ? 2.5 : 1.5,
          strokeDasharray: isConditional && !isActive ? '6 4' : undefined,
        },
      };
    }),
    [visitedEdgeId]
  );

  return (
    <div className="relative w-full h-full bg-paper overflow-hidden">
      {/* Stage legend strip */}
      <StageLegend />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
        fitViewOptions={{ padding: 0.18, minZoom: 0.4, maxZoom: 1.15 }}
        minZoom={0.3}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1}
          color="#C7BDAA"
        />
      </ReactFlow>

      {/* Token rides on top, in screen coords, viewport-aware */}
      <Token />

      {/* Make NODE_WIDTH/HEIGHT available to CSS if ever needed */}
      <style>{`:root { --node-w: ${NODE_WIDTH}px; --node-h: ${NODE_HEIGHT}px; }`}</style>
    </div>
  );
}

export default function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
