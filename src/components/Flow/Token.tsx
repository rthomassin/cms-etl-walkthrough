import { useEffect, useRef, useState } from 'react';
import { useViewport } from '@xyflow/react';
import { useStore, getActiveScenario } from '../../engine/store';
import { getNode, NODE_WIDTH, NODE_HEIGHT } from '../../scenarios/pipeline';

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

const CENTER = { x: NODE_WIDTH / 2, y: NODE_HEIGHT / 2 };

export default function Token() {
  const playing    = useStore(s => s.playing);
  const speed      = useStore(s => s.speed);
  const stepIndex  = useStore(s => s.stepIndex);
  const scenarioId = useStore(s => s.activeScenario);
  const laborRow   = useStore(s => s.laborRow);

  // React Flow's viewport transform — needed to map diagram coords to screen coords.
  const viewport = useViewport();

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

  // Map diagram coords → screen coords via React Flow viewport transform.
  const screenX = viewport.x + pos.x * viewport.zoom;
  const screenY = viewport.y + pos.y * viewport.zoom;

  // Short value label on the capsule: prefer employeeId if set, else hours.
  const label =
    laborRow.employeeId ? `ID ${laborRow.employeeId}` :
    laborRow.hours !== undefined ? `${laborRow.hours}h` :
    '•';

  return (
    <div
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: screenX, top: screenY }}
    >
      <div className="relative flex items-center justify-center">
        {/* Glow halo */}
        <div className="absolute inset-0 -m-3 rounded-full bg-brand-secondary/30 blur-md token-pulse" />
        {/* Capsule with value */}
        <div className="relative px-2.5 py-1 rounded-full bg-brand-secondary text-white font-mono text-[10px] font-semibold tracking-wide2 shadow-paperSm ring-2 ring-paper">
          {label}
        </div>
      </div>
    </div>
  );
}
