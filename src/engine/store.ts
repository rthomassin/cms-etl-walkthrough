import { create } from 'zustand';
import { standardScenario } from '../scenarios/standard';
import { overtimeScenario } from '../scenarios/overtime';
import { findStepIndexForNode } from '../scenarios/pipeline';
import type { LaborRow, NodeId, Scenario, ScenarioId } from '../scenarios/types';

const SCENARIOS: Record<ScenarioId, Scenario> = {
  standard: standardScenario,
  overtime: overtimeScenario,
};

type Speed = 0.5 | 1 | 2;

type StoreState = {
  activeScenario: ScenarioId;
  /** Index into scenario.steps: 0 = not started. The data payload is derived
   *  from applying all rowPatches up to this index. */
  stepIndex: number;
  /** The currently-selected node in click-to-explore mode. `null` = no node
   *  selected (ContextPanel shows intro). When set via selectNode(), stepIndex
   *  auto-syncs so the data payload reflects the state at that node. */
  selectedNodeId: NodeId | null;
  playing: boolean;
  speed: Speed;
  laborRow: Partial<LaborRow>;
  actions: {
    play: () => void;
    pause: () => void;
    step: () => void;
    stepBack: () => void;
    reset: () => void;
    setScenario: (id: ScenarioId) => void;
    setSpeed: (s: Speed) => void;
    /** Click-to-explore: select a node. Updates laborRow to the state at that
     *  node in the active scenario. Pass `null` to deselect (intro view). */
    selectNode: (nodeId: NodeId | null) => void;
  };
};

/** Recompute laborRow by applying startingRow + rowPatches from step 0..index-1. */
function computeRow(scenario: Scenario, stepIndex: number): Partial<LaborRow> {
  let row: Partial<LaborRow> = { ...scenario.startingRow };
  const upTo = Math.min(stepIndex, scenario.steps.length);
  for (let i = 0; i < upTo; i++) {
    const patch = scenario.steps[i].rowPatch;
    if (patch) row = { ...row, ...patch };
  }
  return row;
}

export const useStore = create<StoreState>((set, get) => ({
  activeScenario: 'standard',
  stepIndex: 0,
  selectedNodeId: null,
  playing: false,
  speed: 1,
  laborRow: { ...standardScenario.startingRow },

  actions: {
    play: () => set({ playing: true }),
    pause: () => set({ playing: false }),

    step: () => {
      const { activeScenario, stepIndex } = get();
      const scenario = SCENARIOS[activeScenario];
      if (stepIndex >= scenario.steps.length) return;
      const next = stepIndex + 1;
      set({ stepIndex: next, laborRow: computeRow(scenario, next) });
    },

    stepBack: () => {
      const { activeScenario, stepIndex } = get();
      if (stepIndex <= 0) return;
      const scenario = SCENARIOS[activeScenario];
      const next = stepIndex - 1;
      set({ stepIndex: next, laborRow: computeRow(scenario, next) });
    },

    reset: () => {
      const scenario = SCENARIOS[get().activeScenario];
      set({
        stepIndex: 0,
        selectedNodeId: null,
        playing: false,
        laborRow: { ...scenario.startingRow },
      });
    },

    setScenario: (id) => {
      const scenario = SCENARIOS[id];
      set({
        activeScenario: id,
        stepIndex: 0,
        selectedNodeId: null,
        playing: false,
        laborRow: { ...scenario.startingRow },
      });
    },

    setSpeed: (s) => set({ speed: s }),

    selectNode: (nodeId) => {
      const scenario = SCENARIOS[get().activeScenario];
      if (nodeId === null) {
        set({ selectedNodeId: null, stepIndex: 0, laborRow: { ...scenario.startingRow } });
        return;
      }
      // Find the step whose `to` is this node — that step's prose describes
      // what the node does, and applying rowPatches up through it gives the
      // data state "at" that node.
      const idx = findStepIndexForNode(scenario.steps, nodeId);
      if (idx < 0) {
        // Node isn't in this scenario's path. Still select it; data payload
        // stays at starting row.
        set({ selectedNodeId: nodeId, stepIndex: 0, laborRow: { ...scenario.startingRow } });
        return;
      }
      const newStepIndex = idx + 1;
      set({
        selectedNodeId: nodeId,
        stepIndex: newStepIndex,
        laborRow: computeRow(scenario, newStepIndex),
      });
    },
  },
}));

/** Expose for non-hook contexts (e.g. components outside a render function). */
export function getActiveScenario(): Scenario {
  return SCENARIOS[useStore.getState().activeScenario];
}
