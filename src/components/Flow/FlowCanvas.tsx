import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  pipelineNodes,
  pipelineEdges,
  NODE_WIDTH,
  NODE_HEIGHT,
  STAGE_LABELS,
  getPredecessors,
  getSuccessors,
} from '../../scenarios/pipeline';
import type { Stage } from '../../scenarios/types';
import StageNode, { type StageNodeData } from './StageNode';
import { useStore } from '../../engine/store';

const nodeTypes = { stage: StageNode };

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

/** Small hint at bottom of the canvas telling the user they can click. */
function ClickHint({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-ink/85 backdrop-blur-sm text-paper font-sans text-[12px] shadow-paperLg">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M7 2v5l3 3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </svg>
      Click any step to see what it does
    </div>
  );
}

function CanvasInner() {
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const selectNode = useStore(s => s.actions.selectNode);

  // Precompute connection maps for the selected node. Works whether or not
  // the scenario visits it — pipeline edges define the structural graph.
  const { inputIds, outputIds } = useMemo(() => {
    if (selectedNodeId === null) return { inputIds: new Set<number>(), outputIds: new Set<number>() };
    return {
      inputIds:  new Set(getPredecessors(selectedNodeId)),
      outputIds: new Set(getSuccessors(selectedNodeId)),
    };
  }, [selectedNodeId]);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    const id = Number(node.id);
    // Clicking the selected node deselects.
    if (id === selectedNodeId) {
      selectNode(null);
    } else {
      selectNode(id);
    }
  }, [selectedNodeId, selectNode]);

  const onPaneClick = useCallback(() => {
    // Clicking empty canvas deselects
    if (selectedNodeId !== null) selectNode(null);
  }, [selectedNodeId, selectNode]);

  const nodes: Node<StageNodeData>[] = useMemo(
    () => pipelineNodes.map(n => {
      const isSelected = selectedNodeId === n.id;
      const isInput    = inputIds.has(n.id);
      const isOutput   = outputIds.has(n.id);
      const isDimmed   = selectedNodeId !== null && !isSelected && !isInput && !isOutput;
      return {
        id: String(n.id),
        type: 'stage',
        position: n.position,
        draggable: false,
        data: {
          label: n.label,
          stage: n.stage,
          nodeNumber: n.id,
          conditional: n.conditional,
          isSelected,
          isInput,
          isOutput,
          isDimmed,
        },
      };
    }),
    [selectedNodeId, inputIds, outputIds]
  );

  const edges: Edge[] = useMemo(
    () => pipelineEdges.map(e => {
      const isIncomingToSelected = selectedNodeId !== null && e.to === selectedNodeId;
      const isOutgoingFromSelected = selectedNodeId !== null && e.from === selectedNodeId;
      const isRelevant = isIncomingToSelected || isOutgoingFromSelected;
      const isConditional = e.id === '9-10' || e.id === '10-11';
      const isDimmed = selectedNodeId !== null && !isRelevant;

      let stroke = '#B5A98F';
      let strokeWidth = 1.5;
      if (isIncomingToSelected) { stroke = '#3F8B4F'; strokeWidth = 2.5; }  // green in
      if (isOutgoingFromSelected) { stroke = '#DC3223'; strokeWidth = 2.5; } // red out

      return {
        id: e.id,
        source: String(e.from),
        target: String(e.to),
        type: 'smoothstep',
        animated: isRelevant,
        style: {
          stroke,
          strokeWidth,
          strokeDasharray: isConditional && !isRelevant ? '6 4' : undefined,
          opacity: isDimmed ? 0.35 : 1,
          transition: 'stroke 220ms, stroke-width 220ms, opacity 220ms',
        },
      };
    }),
    [selectedNodeId]
  );

  return (
    <div className="relative w-full h-full bg-paper overflow-hidden">
      <StageLegend />
      <ClickHint show={selectedNodeId === null} />

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
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1}
          color="#C7BDAA"
        />
      </ReactFlow>

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
