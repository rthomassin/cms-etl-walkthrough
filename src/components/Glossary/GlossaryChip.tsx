import { useState } from 'react';
import { glossary } from '../../scenarios/glossary';

export default function GlossaryChip() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="text-sm px-3 py-1 rounded-full border border-text-muted/30 hover:bg-text-muted/10"
      >
        Glossary
      </button>
      {open && (
        <div role="dialog" aria-label="Glossary" className="absolute right-0 top-full mt-2 w-80 max-h-[60vh] overflow-auto rounded-md bg-white shadow-xl border border-text-muted/20 p-3 z-30">
          <dl className="text-sm space-y-2">
            {glossary.map(g => (
              <div key={g.term}>
                <dt className="font-semibold text-text-strong">{g.term}</dt>
                <dd className="text-text-muted">{g.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
