import { render, screen, act, fireEvent } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import App from '../App';
import { useStore } from '../engine/store';
import { standardScenario } from '../scenarios/standard';
import { overtimeScenario } from '../scenarios/overtime';

beforeEach(() => {
  vi.useFakeTimers();
  useStore.getState().actions.reset();
  useStore.setState({ activeScenario: 'standard' });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('App — integration', () => {
  it('plays the standard scenario end-to-end and auto-pauses at node 13', () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /play/i }));
    });
    act(() => { vi.advanceTimersByTime(30_000); });

    const s = useStore.getState();
    expect(s.stepIndex).toBe(standardScenario.steps.length);
    expect(s.playing).toBe(false);
    expect(s.laborRow.loadedCost).toBe(15000);
  });

  it('switching to overtime resets and eventually visits node 10', () => {
    render(<App />);

    act(() => {
      fireEvent.click(screen.getByRole('tab', { name: 'Overtime' }));
    });
    expect(useStore.getState().activeScenario).toBe('overtime');
    expect(useStore.getState().stepIndex).toBe(0);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /play/i }));
    });
    act(() => { vi.advanceTimersByTime(30_000); });

    const s = useStore.getState();
    expect(s.stepIndex).toBe(overtimeScenario.steps.length);
    expect(s.laborRow.catchupByProject).toEqual([
      { projectCode: 'TOR-ITB-015-EL', hours: 16.8 },
      { projectCode: 'TOR-ITB-015-ME', hours: 11.2 },
    ]);
  });
});
