import Header from './components/Header/Header';
import FlowCanvas from './components/Flow/FlowCanvas';
import ContextPanel from './components/Context/ContextPanel';

export default function App() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans flex flex-col">
      <Header />
      <div className="flex-1 grid grid-cols-[1fr_320px] min-h-0">
        <FlowCanvas />
        <ContextPanel />
      </div>
    </div>
  );
}
