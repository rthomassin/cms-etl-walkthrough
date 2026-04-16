import { useStore } from '../../engine/store';

export default function PlaybackControls() {
  const playing = useStore(s => s.playing);
  const speed   = useStore(s => s.speed);
  const { play, pause, step, stepBack, reset, setSpeed } = useStore(s => s.actions);

  return (
    <div className="flex items-center gap-2">
      <button
        aria-label="Step back"
        onClick={stepBack}
        className="px-2 py-1 rounded border border-text-muted/30 hover:bg-text-muted/10"
      >◀◀</button>

      {playing ? (
        <button
          aria-label="Pause"
          onClick={pause}
          className="px-3 py-1 rounded bg-brand-primary text-white"
        >⏸ Pause</button>
      ) : (
        <button
          aria-label="Play"
          onClick={play}
          className="px-3 py-1 rounded bg-brand-primary text-white"
        >▶ Play</button>
      )}

      <button
        aria-label="Step forward"
        onClick={step}
        className="px-2 py-1 rounded border border-text-muted/30 hover:bg-text-muted/10"
      >▶▶</button>

      <button
        aria-label="Reset"
        onClick={reset}
        className="px-2 py-1 rounded border border-text-muted/30 hover:bg-text-muted/10"
      >↻</button>

      <label className="flex items-center gap-1 ml-2 text-xs text-text-muted">
        <span>Speed</span>
        <input
          type="range"
          aria-label="Speed"
          min={0.5}
          max={2}
          step={0.5}
          value={speed}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v === 0.5 || v === 1 || v === 2) setSpeed(v);
          }}
        />
        <span className="w-8 text-right">{speed}×</span>
      </label>
    </div>
  );
}
