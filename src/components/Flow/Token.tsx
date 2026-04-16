import { useEffect, useRef, useState } from 'react';
import { useStore, getActiveScenario } from '../../engine/store';
import { getNode } from '../../scenarios/pipeline';

/** A straight-line interpolation is enough — React Flow renders curved edges,
 *  but for the token we just need a visually smooth motion between node centers. */
function interpolate(
  from: { x: number; y: number },
  to: { x: number; y: number },
  t: number
) {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}

/** Node width 176 (w-44), height 80 (h-20) — center offset. */
const CENTER = { x: 88, y: 40 };

export default function Token() {
  const playing    = useStore(s => s.playing);
  const speed      = useStore(s => s.speed);
  const stepIndex  = useStore(s => s.stepIndex);
  const scenarioId = useStore(s => s.activeScenario);

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (stepIndex === 0) {
      setPos(null);
      return;
    }
    const scenario = getActiveScenario();
    const step = scenario.steps[stepIndex - 1];
    if (!step) return;

    const toNode = getNode(step.to);
    const fromNode = step.from === null || step.from === step.to ? toNode : getNode(step.from);

    const start = performance.now();
    const duration = playing ? Math.max(1, step.ms / speed) : 1;

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      setPos(interpolate(
        { x: fromNode.position.x + CENTER.x, y: fromNode.position.y + CENTER.y },
        { x: toNode.position.x   + CENTER.x, y: toNode.position.y   + CENTER.y },
        t
      ));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stepIndex, playing, speed, scenarioId]);

  if (!pos) return null;

  return (
    <div
      className="pointer-events-none absolute w-4 h-4 rounded-full bg-token-fill shadow-md z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: pos.x, top: pos.y }}
    />
  );
}
