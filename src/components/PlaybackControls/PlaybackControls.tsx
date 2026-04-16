import clsx from 'clsx';
import { useStore } from '../../engine/store';

/** Monochrome geometric icons — keeps the aesthetic editorial/technical rather
 *  than relying on unicode glyphs that render inconsistently. */

const Icon = {
  StepBack: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="2" y="3" width="1.5" height="8" fill="currentColor" />
      <path d="M12 3 L5 7 L12 11 Z" fill="currentColor" />
    </svg>
  ),
  StepForward: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2 3 L9 7 L2 11 Z" fill="currentColor" />
      <rect x="10.5" y="3" width="1.5" height="8" fill="currentColor" />
    </svg>
  ),
  Play: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 2 L12 7 L3 12 Z" fill="currentColor" />
    </svg>
  ),
  Pause: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="3" y="2.5" width="2.8" height="9" fill="currentColor" />
      <rect x="8.2" y="2.5" width="2.8" height="9" fill="currentColor" />
    </svg>
  ),
  Reset: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3 7a4 4 0 1 1 1 2.6"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path d="M3 3.5v3h3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  ),
};

function CtrlButton({
  label, onClick, children,
}: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center rounded border border-paper-rule bg-paper hover:bg-paper-alt text-ink transition-colors"
    >
      {children}
    </button>
  );
}

export default function PlaybackControls() {
  const playing = useStore(s => s.playing);
  const speed   = useStore(s => s.speed);
  const { play, pause, step, stepBack, reset, setSpeed } = useStore(s => s.actions);

  return (
    <div className="flex items-center gap-2">
      <CtrlButton label="Step back" onClick={stepBack}><Icon.StepBack /></CtrlButton>

      <button
        aria-label={playing ? 'Pause' : 'Play'}
        onClick={playing ? pause : play}
        className={clsx(
          'h-8 px-3 flex items-center gap-1.5 rounded text-[12px] font-medium font-sans transition-colors',
          playing
            ? 'bg-ink text-paper hover:bg-ink/90'
            : 'bg-brand-primary text-white hover:bg-brand-primary/90',
        )}
      >
        {playing ? <Icon.Pause /> : <Icon.Play />}
        <span>{playing ? 'Pause' : 'Play'}</span>
      </button>

      <CtrlButton label="Step forward" onClick={step}><Icon.StepForward /></CtrlButton>
      <CtrlButton label="Reset" onClick={reset}><Icon.Reset /></CtrlButton>

      <label className="flex items-center gap-1.5 ml-2 pl-2 border-l border-paper-rule text-[10px] font-mono uppercase tracking-wide2 text-ink-faint">
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
          className="w-16 accent-brand-primary"
        />
        <span className="font-mono text-[11px] text-ink tabular-nums w-7 text-right">
          {speed}×
        </span>
      </label>
    </div>
  );
}
