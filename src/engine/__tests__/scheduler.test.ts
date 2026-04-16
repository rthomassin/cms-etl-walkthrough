import { renderHook, act } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import { useScheduler } from '../scheduler';
import { useStore } from '../store';

beforeEach(() => {
  vi.useFakeTimers();
  useStore.getState().actions.reset();
  useStore.setState({ activeScenario: 'standard', speed: 1 });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('scheduler', () => {
  it('does nothing while paused', () => {
    renderHook(() => useScheduler());
    act(() => { vi.advanceTimersByTime(5000); });
    expect(useStore.getState().stepIndex).toBe(0);
  });

  it('advances one step after the first step ms when playing', () => {
    renderHook(() => useScheduler());
    act(() => { useStore.getState().actions.play(); });
    // First scenario step has ms=400
    act(() => { vi.advanceTimersByTime(400); });
    expect(useStore.getState().stepIndex).toBe(1);
  });

  it('advances sequentially through multiple steps', () => {
    renderHook(() => useScheduler());
    act(() => { useStore.getState().actions.play(); });
    // Steps 1..3 are 400, 800, 800 ms — total 2000
    act(() => { vi.advanceTimersByTime(2000); });
    expect(useStore.getState().stepIndex).toBe(3);
  });

  it('stops at the last step and sets playing=false', () => {
    renderHook(() => useScheduler());
    act(() => { useStore.getState().actions.play(); });
    // Advance far past the scenario's total duration
    act(() => { vi.advanceTimersByTime(60_000); });
    const s = useStore.getState();
    expect(s.stepIndex).toBeGreaterThanOrEqual(13);
    expect(s.playing).toBe(false);
  });

  it('respects the speed multiplier (2x takes half the time)', () => {
    renderHook(() => useScheduler());
    act(() => { useStore.getState().actions.setSpeed(2); });
    act(() => { useStore.getState().actions.play(); });
    // First step is 400ms at 1x → 200ms at 2x
    act(() => { vi.advanceTimersByTime(200); });
    expect(useStore.getState().stepIndex).toBe(1);
  });
});
