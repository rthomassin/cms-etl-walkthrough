import clsx from 'clsx';
import { useStore } from '../../engine/store';

const TABS: Array<{ id: 'standard' | 'overtime'; label: string; sub: string }> = [
  { id: 'standard', label: 'Standard',  sub: 'Happy path' },
  { id: 'overtime', label: 'Overtime',  sub: 'Catchup split' },
];

export default function ScenarioToggle() {
  const active      = useStore(s => s.activeScenario);
  const setScenario = useStore(s => s.actions.setScenario);

  return (
    <div
      className="inline-flex items-stretch rounded-md overflow-hidden border border-paper-rule bg-paper/70"
      role="tablist"
      aria-label="Scenario"
    >
      {TABS.map((tab, i) => (
        <button
          key={tab.id}
          role="tab"
          aria-label={tab.label}
          aria-selected={active === tab.id}
          onClick={() => setScenario(tab.id)}
          className={clsx(
            'flex items-center gap-2 px-3.5 py-1.5 text-left transition-colors',
            i > 0 && 'border-l border-paper-rule',
            active === tab.id
              ? 'bg-ink text-paper'
              : 'text-ink hover:bg-paper-alt'
          )}
        >
          <span className={clsx(
            'inline-block w-1.5 h-1.5 rounded-full',
            active === tab.id ? 'bg-brand-secondary' : 'bg-ink-faint/50'
          )} />
          <div className="flex flex-col leading-none">
            <span className="font-sans text-[13px] font-medium">{tab.label}</span>
            <span className={clsx(
              'font-mono text-[9.5px] uppercase tracking-wide2 mt-0.5',
              active === tab.id ? 'text-paper/70' : 'text-ink-faint'
            )}>
              {tab.sub}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
