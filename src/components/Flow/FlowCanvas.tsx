import { useMemo } from 'react';
import { ReactFlow, Background, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { pipelineNodes, pipelineEdges } from '../../scenarios/pipeline';
import StageNode, { type StageNodeData } from './StageNode';
import Token from './Token';
import Tooltip from './Tooltip';
import Legend from './Legend';
import { useStore, getActiveScenario } from '../../engine/store';
import { useScheduler } from '../../engine/scheduler';

const nodeTypes = { stage: StageNode };

export default function FlowCanvas() {
  useScheduler();

  const stepIndex = useStore(s => s.stepIndex);
  const activeScenarioId = useStore(s => s.activeScenario);

  const activeNodeId = useMemo(() => {
    const scenario = getActiveScenario();
    if (stepIndex === 0) return null;
    return scenario.steps[stepIndex - 1]?.to ?? null;
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
        conditional: n.conditional,
        isActive: activeNodeId === n.id,
      },
    })),
    [activeNodeId]
  );

  const edges: Edge[] = useMemo(
    () => pipelineEdges.map(e => ({
      id: e.id,
      source: String(e.from),
      target: String(e.to),
      type: 'smoothstep',
      style: { stroke: '#c2c7cc', strokeWidth: 2 },
    })),
    []
  );

  return (
    <div className="relative w-full h-[calc(100vh-60px)] bg-surface">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} />
      </ReactFlow>
      <Token />
      <Tooltip />
      <Legend />
    </div>
  );
}
