import clsx from 'clsx';
import { useStore } from '../../engine/store';

const TABS: Array<{ id: 'standard' | 'overtime'; label: string }> = [
  { id: 'standard', label: 'Standard' },
  { id: 'overtime', label: 'Overtime' },
];

export default function ScenarioToggle() {
  const active  = useStore(s => s.activeScenario);
  const setScenario = useStore(s => s.actions.setScenario);

  return (
    <div className="inline-flex rounded-full border border-text-muted/30 p-0.5" role="tablist" aria-label="Scenario">
      {TABS.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => setScenario(tab.id)}
          className={clsx(
            'px-4 py-1 text-sm rounded-full transition-colors',
            active === tab.id
              ? 'bg-brand-primary text-white'
              : 'text-text-strong hover:bg-text-muted/10'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
