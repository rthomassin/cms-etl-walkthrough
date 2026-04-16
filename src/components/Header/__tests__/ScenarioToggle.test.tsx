import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach } from 'vitest';
import ScenarioToggle from '../ScenarioToggle';
import { useStore } from '../../../engine/store';

beforeEach(() => {
  useStore.getState().actions.reset();
  useStore.setState({ activeScenario: 'standard' });
});

describe('<ScenarioToggle />', () => {
  it('renders both tabs with the correct initial selection', () => {
    render(<ScenarioToggle />);
    expect(screen.getByRole('tab', { name: 'Standard' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Overtime' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls setScenario when the other tab is clicked', async () => {
    render(<ScenarioToggle />);
    await userEvent.click(screen.getByRole('tab', { name: 'Overtime' }));
    expect(useStore.getState().activeScenario).toBe('overtime');
  });
});
