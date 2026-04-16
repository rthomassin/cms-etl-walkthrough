import Header from './components/Header/Header';
import FlowCanvas from './components/Flow/FlowCanvas';

export default function App() {
  return (
    <div className="min-h-screen bg-surface font-body text-text-strong">
      <Header />
      <FlowCanvas />
    </div>
  );
}
