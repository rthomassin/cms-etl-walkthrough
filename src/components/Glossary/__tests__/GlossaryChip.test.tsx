import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlossaryChip from '../GlossaryChip';

describe('<GlossaryChip />', () => {
  it('is closed by default', () => {
    render(<GlossaryChip />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on click and shows glossary entries', async () => {
    render(<GlossaryChip />);
    await userEvent.click(screen.getByRole('button', { name: /glossary/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Application For Payment/i)).toBeInTheDocument();
  });

  it('closes on second click', async () => {
    render(<GlossaryChip />);
    const btn = screen.getByRole('button', { name: /glossary/i });
    await userEvent.click(btn);
    await userEvent.click(btn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
