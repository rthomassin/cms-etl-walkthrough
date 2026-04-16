import BrandLogo from './BrandLogo';
import ScenarioToggle from './ScenarioToggle';
import PlaybackControls from '../PlaybackControls/PlaybackControls';
import GlossaryChip from '../Glossary/GlossaryChip';

export default function Header() {
  return (
    <header className="h-[60px] flex items-center justify-between px-6 border-b border-text-muted/20 bg-surface">
      <BrandLogo />
      <ScenarioToggle />
      <div className="flex items-center gap-3">
        <PlaybackControls />
        <GlossaryChip />
      </div>
    </header>
  );
}
