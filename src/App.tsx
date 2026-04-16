import FlowCanvas from './components/Flow/FlowCanvas';
import { useStore } from './engine/store';

export default function App() {
  const actions = useStore(s => s.actions);
  return (
    <div className="min-h-screen bg-surface font-body text-text-strong">
      <header className="h-[60px] flex items-center px-6 border-b border-text-muted/20 gap-4">
        <h1 className="font-heading text-lg text-brand-primary">CMS ETL Walkthrough</h1>
        <button onClick={actions.step} className="px-3 py-1 border rounded">Step</button>
        <button onClick={actions.reset} className="px-3 py-1 border rounded">Reset</button>
        <button onClick={actions.play} className="px-3 py-1 border rounded">Play</button>
        <button onClick={actions.pause} className="px-3 py-1 border rounded">Pause</button>
      </header>
      <FlowCanvas />
    </div>
  );
}
