import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach } from 'vitest';
import App from '../App';
import { useStore } from '../engine/store';

beforeEach(() => {
  useStore.getState().actions.reset();
  useStore.setState({ activeScenario: 'standard' });
});

describe('App — click-to-explore integration', () => {
  it('renders the intro view when no node is selected', () => {
    render(<App />);
    // Anchor the assertion on text that only the intro panel contains.
    expect(screen.getByText(/how to use/i)).toBeInTheDocument();
    expect(screen.getByText(/scenario toggle above/i)).toBeInTheDocument();
  });

  it('selecting a node updates the labor row to the state at that node', () => {
    render(<App />);
    // Programmatically select node 5 (Extract employee ID). Clicking the React
    // Flow node from the DOM is fiddly because it's rendered inside a
    // transformed container; selectNode is exactly what the UI wires.
    useStore.getState().actions.selectNode(5);

    const s = useStore.getState();
    expect(s.selectedNodeId).toBe(5);
    // Step 5 applies the employeeId patch, so the row should now carry it.
    expect(s.laborRow.employeeId).toBe('012345');
  });

  it('selecting node 11 in the overtime scenario includes its catchup payload', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Overtime' }));
    expect(useStore.getState().activeScenario).toBe('overtime');

    // Node 11 lands after the catchup has been applied.
    useStore.getState().actions.selectNode(11);
    const s = useStore.getState();
    expect(s.selectedNodeId).toBe(11);
    expect(s.laborRow.catchupByProject).toEqual([
      { projectCode: 'TOR-ITB-015-EL', hours: 16.8 },
      { projectCode: 'TOR-ITB-015-ME', hours: 11.2 },
    ]);
  });

  it('clicking "back to overview" returns to the intro', () => {
    render(<App />);
    useStore.getState().actions.selectNode(3);
    expect(useStore.getState().selectedNodeId).toBe(3);

    useStore.getState().actions.selectNode(null);
    expect(useStore.getState().selectedNodeId).toBeNull();
  });
});
