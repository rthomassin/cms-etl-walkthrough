import { useEffect, useRef, useState } from 'react';
import { useStore, getActiveScenario } from '../../engine/store';
import { getNode } from '../../scenarios/pipeline';

const FADE_DELAY_MS = 3000;

export default function Tooltip() {
  const stepIndex = useStore(s => s.stepIndex);
  const playing   = useStore(s => s.playing);

  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = stepIndex === 0 ? null : getActiveScenario().steps[stepIndex - 1];

  useEffect(() => {
    if (!step) {
      setVisible(false);
      return;
    }
    setVisible(true);

    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    // Only auto-fade while playing; on pause or hover the tooltip persists.
    if (playing && !hovered) {
      fadeTimerRef.current = setTimeout(() => setVisible(false), FADE_DELAY_MS);
    }
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [stepIndex, playing, hovered, step]);

  if (!step || !visible) return null;

  const toNode = getNode(step.to);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="absolute z-20 max-w-[320px] px-3 py-2 rounded-md bg-white shadow-lg border border-text-muted/20 text-sm text-text-strong transition-opacity"
      style={{
        left: toNode.position.x + 88,  // node center X
        top:  toNode.position.y - 12,  // just above the node
        transform: 'translate(-50%, -100%)',
      }}
    >
      {step.tooltip}
    </div>
  );
}
