import { useState } from 'react';

const ITEMS: Array<{ color: string; label: string }> = [
  { color: 'bg-stage-source',        label: 'Source' },
  { color: 'bg-stage-cleaning',      label: 'Cleaning' },
  { color: 'bg-stage-consolidation', label: 'Consolidation' },
  { color: 'bg-stage-upload',        label: 'Upload' },
];

export default function Legend() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 bg-white/90 backdrop-blur px-3 py-2 rounded-md shadow border border-text-muted/20 text-xs">
      {ITEMS.map(i => (
        <div key={i.label} className="flex items-center gap-1">
          <span className={`${i.color} w-3 h-3 rounded-sm inline-block`} />
          <span>{i.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1 ml-2 pl-2 border-l border-text-muted/20">
        <span className="w-3 h-3 rounded-full bg-token-fill inline-block" />
        <span>Data point</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 text-text-muted hover:text-text-strong"
        aria-label="Dismiss legend"
      >×</button>
    </div>
  );
}
