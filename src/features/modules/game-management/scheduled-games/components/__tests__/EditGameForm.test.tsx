import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditGameForm from '../EditGameForm';

// Mock the timezone utils
jest.mock('../../utils/timezoneUtils', () => ({
  formatDateTimeInTimezone: jest.fn(() => '2025-01-01 12:00 PM ET'),
}));

const mockFormatDateTimeInTimezone = require('../../utils/timezoneUtils').formatDateTimeInTimezone;

describe('EditGameForm', () => {
  const mockGame = {
    id: 'game-123',
    gameId: 123,
    gameState: 'scheduled' as const,
    teamSize: '2v2' as const,
    customTeamSize: '',
    gameType: 'elo' as const,
    gameVersion: 'v3.29',
    gameLength: 2400,
    modes: ['Standard', 'Custom Mode 1'],
    creatorName: 'Test Creator',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  };

  const defaultProps = {
    game: mockGame,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    isSubmitting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    defaultProps.onSubmit.mockResolvedValue(undefined);
  });

  it('renders the form with game data pre-filled', () => {
    render(<EditGameForm {...defaultProps} />);

    expect(screen.getByText('Edit Scheduled Game')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2v2')).toBeChecked();
    expect(screen.getByDisplayValue('tournament')).toBeChecked();
    expect(screen.getByLabelText('Game Version')).toHaveValue('v3.29');
    expect(screen.getByLabelText('Game Length (minutes)')).toHaveValue(2400);
  });

  it('renders game modes as checkboxes', () => {
    render(<EditGameForm {...defaultProps} />);

    const standardCheckbox = screen.getByLabelText('Standard');
    const customModeCheckbox = screen.getByLabelText('Custom Mode 1');

    expect(standardCheckbox).toBeChecked();
    expect(customModeCheckbox).toBeChecked();
  });

  it('updates form values when radio buttons change', async () => {
    const user = userEvent.setup();
    render(<EditGameForm {...defaultProps} />);

    const teamSizeRadio = screen.getByDisplayValue('1v1');
    await user.click(teamSizeRadio);

    expect(teamSizeRadio).toBeChecked();
  });

  it('shows custom team size input when Custom is selected', async () => {
    const user = userEvent.setup();
    render(<EditGameForm {...defaultProps} />);

    const customRadio = screen.getByDisplayValue('custom');
    await user.click(customRadio);

    expect(screen.getByPlaceholderText('e.g., 2v2v2, 3v3v3, etc.')).toBeInTheDocument();
  });

  it('hides custom team size input when non-custom option is selected', async () => {
    const user = userEvent.setup();
    render(<EditGameForm {...defaultProps} />);

    // First select Custom to show the input
    const customRadio = screen.getByDisplayValue('custom');
    await user.click(customRadio);
    expect(screen.getByPlaceholderText('e.g., 2v2v2, 3v3v3, etc.')).toBeInTheDocument();

    // Then select 1v1 to hide it
    const oneVsOneRadio = screen.getByDisplayValue('1v1');
    await user.click(oneVsOneRadio);
    expect(screen.queryByPlaceholderText('e.g., 2v2v2, 3v3v3, etc.')).not.toBeInTheDocument();
  });

  it('toggles game mode checkboxes', async () => {
    const user = userEvent.setup();
    render(<EditGameForm {...defaultProps} />);

    const standardCheckbox = screen.getByLabelText('Standard');
    await user.click(standardCheckbox);

    expect(standardCheckbox).not.toBeChecked();
  });

  it('validates custom team size when custom team size is selected', async () => {
    const user = userEvent.setup();
    render(<EditGameForm {...defaultProps} />);

    // Select custom team size
    const customRadio = screen.getByDisplayValue('custom');
    await user.click(customRadio);

    // Clear the custom team size input
    const customInput = screen.getByPlaceholderText('e.g., 2v2v2, 3v3v3, etc.');
    await user.clear(customInput);

    const submitButton = screen.getByRole('button', { name: 'Update Game' });
    await user.click(submitButton);

    expect(screen.getByText('Please specify custom team size')).toBeInTheDocument();
  });

  it('submits form successfully with valid data', async () => {
    const user = userEvent.setup();
    render(<EditGameForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: 'Update Game' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        teamSize: '2v2',
        customTeamSize: '',
        gameType: 'tournament',
        gameVersion: 'v3.29',
        gameLength: 2400,
        modes: ['Standard', 'Custom Mode 1'],
      });
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    // Make the submit hang
    defaultProps.onSubmit.mockImplementation(() => new Promise(() => {}));

    render(<EditGameForm {...defaultProps} isSubmitting={true} />);

    const submitButton = screen.getByRole('button', { name: 'Updating...' });
    expect(submitButton).toBeDisabled();
  });

  it('displays error message on submission failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to update game';
    defaultProps.onSubmit.mockRejectedValue(new Error(errorMessage));

    render(<EditGameForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: 'Update Game' });
    await user.click(submitButton);

    // Wait for the onSubmit to be called and rejected
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalled();
    });

    // Then check for the error message
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<EditGameForm {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('updates form when game prop changes', () => {
    const { rerender } = render(<EditGameForm {...defaultProps} />);

    expect(screen.getByDisplayValue('2v2')).toBeChecked();

    const updatedGame = { ...mockGame, teamSize: '1v1' as const };
    rerender(<EditGameForm {...defaultProps} game={updatedGame} />);

    expect(screen.getByDisplayValue('1v1')).toBeChecked();
  });

  it('renders with correct CSS classes and structure', () => {
    const { container } = render(<EditGameForm {...defaultProps} />);

    // Check for key styling classes
    expect(container.querySelector('.bg-gray-900')).toBeInTheDocument();
    expect(container.querySelector('.border-amber-500\\/30')).toBeInTheDocument();
    expect(container.querySelector('.text-amber-400')).toBeInTheDocument();
  });

  it('handles empty game modes array', () => {
    const gameWithoutModes = { ...mockGame, modes: undefined };
    render(<EditGameForm {...defaultProps} game={gameWithoutModes} />);

    const standardCheckbox = screen.getByLabelText('Standard');
    expect(standardCheckbox).not.toBeChecked();
  });

  it('preserves form state when switching between game types', async () => {
    const user = userEvent.setup();
    render(<EditGameForm {...defaultProps} />);

    const normalRadio = screen.getByDisplayValue('normal');
    await user.click(normalRadio);

    expect(normalRadio).toBeChecked();

    // Switch back
    const eloRadio = screen.getByDisplayValue('elo');
    await user.click(eloRadio);
    expect(eloRadio).toBeChecked();
    expect(normalRadio).not.toBeChecked();
  });
});

