import BrandLogo from './BrandLogo';
import ScenarioToggle from './ScenarioToggle';
import GlossaryChip from '../Glossary/GlossaryChip';
import { useStore, getActiveScenario } from '../../engine/store';

export default function Header() {
  // Subscribe so Header re-renders on scenario change.
  useStore(s => s.activeScenario);
  const scenario = getActiveScenario();

  return (
    <header className="relative h-[64px] flex items-center justify-between px-6 bg-paper border-b border-paper-rule">
      {/* Editorial double-rule bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-ink/20" />
      <div className="absolute bottom-[3px] left-0 right-0 h-px bg-ink/10" />

      <div className="flex items-center gap-5">
        <BrandLogo />
        <div className="hidden lg:flex items-center gap-2 pl-5 border-l border-paper-rule">
          <span className="font-mono text-[10px] uppercase tracking-wide3 text-ink-faint">
            Scenario
          </span>
          <span className="font-display italic text-[14px] text-ink">
            {scenario.title}
          </span>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <ScenarioToggle />
      </div>

      <div className="flex items-center gap-3">
        <GlossaryChip />
      </div>
    </header>
  );
}
