export default function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Minimal geometric mark — blue rectangle with a red accent notch. */}
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden className="flex-none">
        <rect x="1" y="1" width="20" height="20" rx="2" fill="#2850F0" />
        <rect x="13" y="13" width="6" height="6" rx="1" fill="#DC3223" />
      </svg>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[18px] font-medium text-ink tracking-tight2 leading-none">
          CMS Pipeline
        </span>
        <span className="font-mono text-[9.5px] uppercase tracking-wide3 text-ink-faint">
          Walkthrough · v1
        </span>
      </div>
    </div>
  );
}
