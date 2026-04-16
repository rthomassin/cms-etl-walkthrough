import FlowCanvas from './components/Flow/FlowCanvas';

export default function App() {
  return (
    <div className="min-h-screen bg-surface font-body text-text-strong">
      <header className="h-[60px] flex items-center px-6 border-b border-text-muted/20">
        <h1 className="font-heading text-lg text-brand-primary">CMS ETL Walkthrough</h1>
      </header>
      <FlowCanvas />
    </div>
  );
}
