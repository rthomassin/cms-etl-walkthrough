import { beforeEach } from 'vitest';
import { useStore } from '../store';
import { standardScenario } from '../../scenarios/standard';
import { overtimeScenario } from '../../scenarios/overtime';

beforeEach(() => {
  useStore.getState().actions.reset();
  useStore.setState({ activeScenario: 'standard' });
});

describe('store — initial state', () => {
  it('starts on standard scenario, step 0, not playing, 1x speed', () => {
    const s = useStore.getState();
    expect(s.activeScenario).toBe('standard');
    expect(s.stepIndex).toBe(0);
    expect(s.playing).toBe(false);
    expect(s.speed).toBe(1);
  });

  it('starts with the standard scenario starting row', () => {
    const s = useStore.getState();
    expect(s.laborRow.employeeName).toBe(standardScenario.startingRow.employeeName);
  });
});

describe('store — step / stepBack', () => {
  it('step() advances by one and applies rowPatch', () => {
    useStore.getState().actions.step(); // from 0 to 1 (first step, sets nothing extra)
    useStore.getState().actions.step(); // to 2
    useStore.getState().actions.step(); // to 3
    useStore.getState().actions.step(); // to 4
    useStore.getState().actions.step(); // to 5 — employeeId patch applied
    expect(useStore.getState().stepIndex).toBe(5);
    expect(useStore.getState().laborRow.employeeId).toBe('012345');
  });

  it('stepBack() rewinds by one and un-applies later patches', () => {
    const { step, stepBack } = useStore.getState().actions;
    step(); step(); step(); step(); step(); // at step 5, employeeId set
    stepBack();                              // back to step 4, employeeId cleared
    expect(useStore.getState().stepIndex).toBe(4);
    expect(useStore.getState().laborRow.employeeId).toBeUndefined();
  });

  it('step() at the last step is a no-op', () => {
    const total = standardScenario.steps.length;
    useStore.setState({ stepIndex: total });
    useStore.getState().actions.step();
    expect(useStore.getState().stepIndex).toBe(total);
  });

  it('stepBack() at step 0 is a no-op', () => {
    useStore.getState().actions.stepBack();
    expect(useStore.getState().stepIndex).toBe(0);
  });
});

describe('store — play / pause', () => {
  it('play() sets playing=true', () => {
    useStore.getState().actions.play();
    expect(useStore.getState().playing).toBe(true);
  });

  it('pause() sets playing=false', () => {
    useStore.getState().actions.play();
    useStore.getState().actions.pause();
    expect(useStore.getState().playing).toBe(false);
  });
});

describe('store — reset', () => {
  it('reset() returns to step 0, pauses, rebuilds starting row', () => {
    const { step, play, reset } = useStore.getState().actions;
    step(); step(); play();
    reset();
    const s = useStore.getState();
    expect(s.stepIndex).toBe(0);
    expect(s.playing).toBe(false);
    expect(s.laborRow.employeeId).toBeUndefined();
    expect(s.laborRow.employeeName).toBe(standardScenario.startingRow.employeeName);
  });
});

describe('store — setScenario', () => {
  it('swaps the active scenario and resets state', () => {
    const { step, setScenario } = useStore.getState().actions;
    step(); step();
    setScenario('overtime');
    const s = useStore.getState();
    expect(s.activeScenario).toBe('overtime');
    expect(s.stepIndex).toBe(0);
    expect(s.playing).toBe(false);
    expect(s.laborRow.employeeName).toBe(overtimeScenario.startingRow.employeeName);
  });
});

describe('store — setSpeed', () => {
  it.each([0.5, 1, 2])('accepts speed %f', (speed) => {
    useStore.getState().actions.setSpeed(speed as 0.5 | 1 | 2);
    expect(useStore.getState().speed).toBe(speed);
  });
});
