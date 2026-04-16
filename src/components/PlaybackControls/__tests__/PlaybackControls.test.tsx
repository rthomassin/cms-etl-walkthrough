import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach } from 'vitest';
import PlaybackControls from '../PlaybackControls';
import { useStore } from '../../../engine/store';

beforeEach(() => {
  useStore.getState().actions.reset();
});

describe('<PlaybackControls />', () => {
  it('starts showing Play (not Pause)', () => {
    render(<PlaybackControls />);
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });

  it('toggles to Pause after clicking Play', async () => {
    render(<PlaybackControls />);
    await userEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(useStore.getState().playing).toBe(true);
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('advances stepIndex when Step is clicked', async () => {
    render(<PlaybackControls />);
    await userEvent.click(screen.getByRole('button', { name: /step forward/i }));
    expect(useStore.getState().stepIndex).toBe(1);
  });

  it('rewinds stepIndex when Step Back is clicked', async () => {
    useStore.getState().actions.step();
    useStore.getState().actions.step();
    render(<PlaybackControls />);
    await userEvent.click(screen.getByRole('button', { name: /step back/i }));
    expect(useStore.getState().stepIndex).toBe(1);
  });

  it('resets when Reset is clicked', async () => {
    useStore.getState().actions.step();
    render(<PlaybackControls />);
    await userEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(useStore.getState().stepIndex).toBe(0);
  });

  it('changes speed via the slider', () => {
    render(<PlaybackControls />);
    const slider = screen.getByRole('slider', { name: /speed/i });
    fireEvent.change(slider, { target: { value: '2' } });
    expect(useStore.getState().speed).toBe(2);
  });
});
