import { useEffect, useRef } from 'react';
import { useStore, getActiveScenario } from './store';

/**
 * Schedules automatic advancement when playing. Reads each upcoming step's ms,
 * scales by speed, fires store.actions.step() on the timer. Auto-pauses at
 * end of scenario. Clears timer on pause, speed change, scenario swap, reset,
 * or unmount.
 */
export function useScheduler() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playing    = useStore(s => s.playing);
  const stepIndex  = useStore(s => s.stepIndex);
  const speed      = useStore(s => s.speed);
  const scenarioId = useStore(s => s.activeScenario);

  useEffect(() => {
    if (!playing) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const scenario = getActiveScenario();

    if (stepIndex >= scenario.steps.length) {
      useStore.getState().actions.pause();
      return;
    }

    /** Self-rescheduling loop — keeps firing without React re-render cycles. */
    function scheduleNext() {
      const store = useStore.getState();
      const sc = getActiveScenario();
      const idx = store.stepIndex;

      if (!store.playing || idx >= sc.steps.length) {
        if (!store.playing || idx >= sc.steps.length) {
          if (idx >= sc.steps.length) store.actions.pause();
        }
        return;
      }

      const wait = Math.max(1, Math.round(sc.steps[idx].ms / store.speed));
      timeoutRef.current = setTimeout(() => {
        const s = useStore.getState();
        if (!s.playing) return;
        s.actions.step();
        scheduleNext();
      }, wait);
    }

    scheduleNext();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [playing, stepIndex, speed, scenarioId]);
}
