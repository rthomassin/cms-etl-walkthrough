import { create } from 'zustand';
import { standardScenario } from '../scenarios/standard';
import { overtimeScenario } from '../scenarios/overtime';
import type { LaborRow, Scenario, ScenarioId } from '../scenarios/types';

const SCENARIOS: Record<ScenarioId, Scenario> = {
  standard: standardScenario,
  overtime: overtimeScenario,
};

type Speed = 0.5 | 1 | 2;

type StoreState = {
  activeScenario: ScenarioId;
  stepIndex: number;
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
        playing: false,
        laborRow: { ...scenario.startingRow },
      });
    },

    setScenario: (id) => {
      const scenario = SCENARIOS[id];
      set({
        activeScenario: id,
        stepIndex: 0,
        playing: false,
        laborRow: { ...scenario.startingRow },
      });
    },

    setSpeed: (s) => set({ speed: s }),
  },
}));

/** Expose for the scheduler without needing the hook form. */
export function getActiveScenario(): Scenario {
  return SCENARIOS[useStore.getState().activeScenario];
}
