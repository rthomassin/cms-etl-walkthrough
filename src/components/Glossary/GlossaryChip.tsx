import { useEffect, useRef, useState } from 'react';
import { glossary } from '../../scenarios/glossary';

export default function GlossaryChip() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="h-8 px-3 flex items-center gap-1.5 rounded border border-paper-rule bg-paper hover:bg-paper-alt text-[12px] font-sans text-ink transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2.5 2h5a2 2 0 0 1 2 2v7H4a1.5 1.5 0 0 1 0-3h5.5"
            stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
        Glossary
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Glossary"
          className="absolute right-0 top-full mt-2 w-[360px] max-h-[70vh] overflow-auto rounded-md bg-paper shadow-paperLg border border-paper-rule p-4 z-40"
        >
          <div className="font-display italic text-[20px] text-ink mb-1">
            Glossary
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wide3 text-ink-faint mb-3">
            Terms used in the walkthrough
          </div>
          <dl className="space-y-3">
            {glossary.map(g => (
              <div key={g.term} className="border-t border-paper-rule pt-2.5 first:border-t-0 first:pt-0">
                <dt className="font-sans text-[12px] font-semibold text-ink">{g.term}</dt>
                <dd className="font-sans text-[12px] text-ink-muted leading-[1.45] mt-0.5">
                  {g.definition}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
