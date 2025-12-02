import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateGameInlineForm from '../CreateGameInlineForm';

// Mock the timezone utils
jest.mock('../../utils/timezoneUtils', () => ({
  getUserTimezone: jest.fn(() => 'America/New_York'),
  convertLocalToUTC: jest.fn((dateStr, timeStr, timezone) => new Date(`${dateStr}T${timeStr}:00`).toISOString()),
  getCommonTimezones: jest.fn(() => [
    { value: 'America/New_York', label: 'Eastern Time', abbreviation: 'ET' },
    { value: 'America/Los_Angeles', label: 'Pacific Time', abbreviation: 'PT' },
  ]),
  getTimezoneAbbreviation: jest.fn((tz) => tz === 'America/New_York' ? 'ET' : 'PT'),
}));

// Mock the game service
jest.mock('../../lib/scheduledGameService', () => ({
  createScheduledGame: jest.fn(),
}));

const mockCreateScheduledGame = require('../../lib/scheduledGameService').createScheduledGame;

describe('CreateGameInlineForm', () => {
  const defaultProps = {
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up successful mock response
    mockCreateScheduledGame.mockResolvedValue('game-id-123');
  });

  it('renders the form with all required fields', () => {
    render(<CreateGameInlineForm {...defaultProps} />);

    expect(screen.getByText('Create Scheduled Game')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Time')).toBeInTheDocument();
    expect(screen.getByLabelText('Timezone')).toBeInTheDocument();
    expect(screen.getByLabelText('Team Size')).toBeInTheDocument();
    expect(screen.getByLabelText('Game Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Game Version')).toBeInTheDocument();
    expect(screen.getByLabelText('Game Length (minutes)')).toBeInTheDocument();
  });

  it('renders participant input fields', () => {
    render(<CreateGameInlineForm {...defaultProps} />);

    expect(screen.getByText('Participants')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Participant \d+ Name/)).toHaveLength(2);
    expect(screen.getAllByLabelText(/Participant \d+ Discord ID/)).toHaveLength(2);
    expect(screen.getAllByLabelText(/Participant \d+ Result/)).toHaveLength(2);
  });

  it('initializes with current date and time', () => {
    const now = new Date();
    const expectedDate = now.toISOString().slice(0, 10);
    const expectedTime = now.toISOString().slice(11, 16);

    render(<CreateGameInlineForm {...defaultProps} />);

    const dateInput = screen.getByLabelText('Date') as HTMLInputElement;
    const timeInput = screen.getByLabelText('Time') as HTMLInputElement;

    expect(dateInput.value).toBe(expectedDate);
    expect(timeInput.value).toBe(expectedTime);
  });

  it('shows custom team size input when "Custom" is selected', async () => {
    const user = userEvent.setup();
    render(<CreateGameInlineForm {...defaultProps} />);

    const teamSizeSelect = screen.getByLabelText('Team Size');
    await user.selectOptions(teamSizeSelect, 'Custom');

    expect(screen.getByLabelText('Custom Team Size')).toBeInTheDocument();
  });

  it('hides custom team size input when non-custom option is selected', async () => {
    const user = userEvent.setup();
    render(<CreateGameInlineForm {...defaultProps} />);

    // First select Custom to show the input
    const teamSizeSelect = screen.getByLabelText('Team Size');
    await user.selectOptions(teamSizeSelect, 'Custom');
    expect(screen.getByLabelText('Custom Team Size')).toBeInTheDocument();

    // Then select 1v1 to hide it
    await user.selectOptions(teamSizeSelect, '1v1');
    expect(screen.queryByLabelText('Custom Team Size')).not.toBeInTheDocument();
  });

  it('adds new participant when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateGameInlineForm {...defaultProps} />);

    expect(screen.getAllByLabelText(/Participant \d+ Name/)).toHaveLength(2);

    const addButton = screen.getByRole('button', { name: /add participant/i });
    await user.click(addButton);

    expect(screen.getAllByLabelText(/Participant \d+ Name/)).toHaveLength(3);
  });

  it('removes participant when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateGameInlineForm {...defaultProps} />);

    // Add a participant first
    const addButton = screen.getByRole('button', { name: /add participant/i });
    await user.click(addButton);

    expect(screen.getAllByLabelText(/Participant \d+ Name/)).toHaveLength(3);

    // Remove the last participant
    const removeButtons = screen.getAllByRole('button', { name: /remove participant/i });
    await user.click(removeButtons[removeButtons.length - 1]);

    expect(screen.getAllByLabelText(/Participant \d+ Name/)).toHaveLength(2);
  });

  it('validates required fields on submission', async () => {
    const user = userEvent.setup();
    render(<CreateGameInlineForm {...defaultProps} />);

    // Clear participant names (required)
    const nameInputs = screen.getAllByLabelText(/Participant \d+ Name/);
    await user.clear(nameInputs[0]);
    await user.clear(nameInputs[1]);

    const submitButton = screen.getByRole('button', { name: 'Create Game' });
    await user.click(submitButton);

    expect(screen.getByText('All participants must have names')).toBeInTheDocument();
  });

  it('submits form successfully with valid data', async () => {
    const user = userEvent.setup();
    render(<CreateGameInlineForm {...defaultProps} />);

    // Fill in required participant data
    const nameInputs = screen.getAllByLabelText(/Participant \d+ Name/);
    await user.type(nameInputs[0], 'Player 1');
    await user.type(nameInputs[1], 'Player 2');

    const discordInputs = screen.getAllByLabelText(/Participant \d+ Discord ID/);
    await user.type(discordInputs[0], '123456789');
    await user.type(discordInputs[1], '987654321');

    const submitButton = screen.getByRole('button', { name: 'Create Game' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateScheduledGame).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    // Make the service call hang
    mockCreateScheduledGame.mockImplementation(() => new Promise(() => {}));

    render(<CreateGameInlineForm {...defaultProps} />);

    // Fill in required data quickly
    const nameInputs = screen.getAllByLabelText(/Participant \d+ Name/);
    await user.type(nameInputs[0], 'Player 1');
    await user.type(nameInputs[1], 'Player 2');

    const discordInputs = screen.getAllByLabelText(/Participant \d+ Discord ID/);
    await user.type(discordInputs[0], '123456789');
    await user.type(discordInputs[1], '987654321');

    const submitButton = screen.getByRole('button', { name: 'Create Game' });
    await user.click(submitButton);

    // Should show loading state
    expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled();
    expect(screen.getByText('Creating game...')).toBeInTheDocument();
  });

  it('displays error message on submission failure', async () => {
    const user = userEvent.setup();
    mockCreateScheduledGame.mockRejectedValue(new Error('Failed to create game'));

    render(<CreateGameInlineForm {...defaultProps} />);

    // Fill in required data
    const nameInputs = screen.getAllByLabelText(/Participant \d+ Name/);
    await user.type(nameInputs[0], 'Player 1');
    await user.type(nameInputs[1], 'Player 2');

    const discordInputs = screen.getAllByLabelText(/Participant \d+ Discord ID/);
    await user.type(discordInputs[0], '123456789');
    await user.type(discordInputs[1], '987654321');

    const submitButton = screen.getByRole('button', { name: 'Create Game' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to create game')).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateGameInlineForm {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('validates game length is within bounds', async () => {
    const user = userEvent.setup();
    render(<CreateGameInlineForm {...defaultProps} />);

    const lengthInput = screen.getByLabelText('Game Length (minutes)');
    await user.clear(lengthInput);
    await user.type(lengthInput, '10000'); // Too long

    const submitButton = screen.getByRole('button', { name: 'Create Game' });
    await user.click(submitButton);

    expect(screen.getByText('Game length must be between 1 and 1440 minutes')).toBeInTheDocument();
  });

  it('renders with correct CSS classes and structure', () => {
    const { container } = render(<CreateGameInlineForm {...defaultProps} />);

    // Check for key styling classes
    expect(container.querySelector('.bg-gray-900')).toBeInTheDocument();
    expect(container.querySelector('.border-amber-500')).toBeInTheDocument();
    expect(container.querySelector('.text-amber-400')).toBeInTheDocument();
  });
});

