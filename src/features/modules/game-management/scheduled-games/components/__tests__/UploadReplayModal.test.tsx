import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadReplayModal from '../UploadReplayModal';
import type { Game } from '@/features/modules/game-management/games/types';

// Mock the modal accessibility hook
jest.mock('@/features/infrastructure/hooks/useModalAccessibility', () => ({
  useModalAccessibility: jest.fn(() => ({ current: null })),
}));

const mockUseModalAccessibility = require('@/features/infrastructure/hooks/useModalAccessibility').useModalAccessibility;

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('UploadReplayModal', () => {
  const mockGame: Game = {
    id: 'game123',
    gameId: 1001,
    gameState: 'scheduled',
    creatorName: 'Test Creator',
    createdByDiscordId: 'discord123',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
    scheduledDateTime: '2025-01-15T15:00:00Z',
    timezone: 'America/New_York',
    teamSize: '1v1',
    gameType: 'elo',
    status: 'scheduled',
    scheduledGameId: 1,
  };

  const defaultProps = {
    game: mockGame,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseModalAccessibility.mockReturnValue({ current: null });
    mockFetch.mockClear();
  });

  it('renders modal with correct title and description', () => {
    render(<UploadReplayModal {...defaultProps} />);

    expect(screen.getByText('Upload Replay')).toBeInTheDocument();
    expect(screen.getByText(/Upload a \.w3g replay file/)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders file input with correct attributes', () => {
    render(<UploadReplayModal {...defaultProps} />);

    const fileInput = screen.getByLabelText('Replay File (.w3g) *');
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', '.w3g');
    expect(fileInput).toHaveAttribute('required');
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<UploadReplayModal {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: 'Close upload replay modal' });
    await user.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<UploadReplayModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel uploading replay' });
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('shows error when submitting without file', async () => {
    const user = userEvent.setup();
    render(<UploadReplayModal {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: 'Upload Replay' });
    await user.click(submitButton);

    expect(screen.getByText('Please select a replay file')).toBeInTheDocument();
  });

  it('handles successful file upload', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['fake replay content'], 'test.w3g', { type: 'application/octet-stream' });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Replay uploaded successfully!',
        gameId: 'game123',
        archiveId: 'archive123',
      }),
    });

    render(<UploadReplayModal {...defaultProps} />);

    // Select file
    const fileInput = screen.getByLabelText('Replay File (.w3g) *');
    await user.upload(fileInput, mockFile);

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Upload Replay' });
    await user.click(submitButton);

    // Check that upload starts
    await waitFor(() => {
      expect(screen.getByText('Uploading replay file...')).toBeInTheDocument();
    });

    // Check that parsing status appears after delay
    await waitFor(() => {
      expect(screen.getByText('Parsing replay and extracting game data...')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Check that processing status appears
    await waitFor(() => {
      expect(screen.getByText('Processing and saving game data...')).toBeInTheDocument();
    });

    // Check success message
    await waitFor(() => {
      expect(screen.getByText('Replay uploaded successfully!')).toBeInTheDocument();
    });

    // Check that onSuccess is called and modal closes
    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    }, { timeout: 2000 });

    // Verify fetch was called correctly
    expect(mockFetch).toHaveBeenCalledWith('/api/games/game123/upload-replay', {
      method: 'POST',
      body: expect.any(FormData),
    });
  });

  it('handles upload error', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['fake replay content'], 'test.w3g', { type: 'application/octet-stream' });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Invalid replay file format',
      }),
    });

    render(<UploadReplayModal {...defaultProps} />);

    // Select file and submit
    const fileInput = screen.getByLabelText('Replay File (.w3g) *');
    await user.upload(fileInput, mockFile);

    const submitButton = screen.getByRole('button', { name: 'Upload Replay' });
    await user.click(submitButton);

    // Check error message appears
    await waitFor(() => {
      expect(screen.getByText('Invalid replay file format')).toBeInTheDocument();
    });

    // Check that modal doesn't close on error
    expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('handles network error', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['fake replay content'], 'test.w3g', { type: 'application/octet-stream' });

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<UploadReplayModal {...defaultProps} />);

    // Select file and submit
    const fileInput = screen.getByLabelText('Replay File (.w3g) *');
    await user.upload(fileInput, mockFile);

    const submitButton = screen.getByRole('button', { name: 'Upload Replay' });
    await user.click(submitButton);

    // Check error message appears
    await waitFor(() => {
      expect(screen.getByText('Failed to upload replay')).toBeInTheDocument();
    });
  });

  it('disables buttons during submission', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['fake replay content'], 'test.w3g', { type: 'application/octet-stream' });

    // Mock a slow response
    mockFetch.mockImplementation(() => new Promise(resolve =>
      setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, message: 'Success' }),
      }), 100)
    ));

    render(<UploadReplayModal {...defaultProps} />);

    // Select file
    const fileInput = screen.getByLabelText('Replay File (.w3g) *');
    await user.upload(fileInput, mockFile);

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Upload Replay' });
    await user.click(submitButton);

    // Check buttons are disabled during submission
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel uploading replay' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Close upload replay modal' })).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    // Buttons should be enabled again after completion
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('clears file and error state after successful upload', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['fake replay content'], 'test.w3g', { type: 'application/octet-stream' });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Success' }),
    });

    render(<UploadReplayModal {...defaultProps} />);

    // Select file
    const fileInput = screen.getByLabelText('Replay File (.w3g) *');
    await user.upload(fileInput, mockFile);

    // First submit with error
    await user.click(screen.getByRole('button', { name: 'Upload Replay' }));
    await waitFor(() => {
      expect(screen.getByText('Please select a replay file')).toBeInTheDocument();
    });

    // Now submit successfully
    await user.upload(fileInput, mockFile); // Re-select file
    await user.click(screen.getByRole('button', { name: 'Upload Replay' }));

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    // Error should be cleared
    expect(screen.queryByText('Please select a replay file')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<UploadReplayModal {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'upload-replay-title');

    expect(screen.getByText('Upload Replay')).toHaveAttribute('id', 'upload-replay-title');
  });

  it('calls useModalAccessibility with correct parameters', () => {
    render(<UploadReplayModal {...defaultProps} />);

    expect(mockUseModalAccessibility).toHaveBeenCalledWith({
      isOpen: true,
      onClose: defaultProps.onClose,
      trapFocus: true,
      focusOnOpen: true,
    });
  });

  it('renders with correct CSS classes and styling', () => {
    const { container } = render(<UploadReplayModal {...defaultProps} />);

    expect(container.querySelector('.fixed.inset-0')).toBeInTheDocument();
    expect(container.querySelector('.bg-black\\/50')).toBeInTheDocument();
    expect(container.querySelector('.backdrop-blur-sm')).toBeInTheDocument();
    expect(container.querySelector('.animate-scale-in')).toBeInTheDocument();
  });

  it('shows different status messages during upload process', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['fake replay content'], 'test.w3g', { type: 'application/octet-stream' });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Success' }),
    });

    render(<UploadReplayModal {...defaultProps} />);

    // Select file and submit
    const fileInput = screen.getByLabelText('Replay File (.w3g) *');
    await user.upload(fileInput, mockFile);
    await user.click(screen.getByRole('button', { name: 'Upload Replay' }));

    // Check uploading status
    expect(screen.getByText('Uploading replay file...')).toBeInTheDocument();

    // Wait for parsing status (after 1 second timeout)
    await waitFor(() => {
      expect(screen.getByText('Parsing replay and extracting game data...')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Check processing status
    await waitFor(() => {
      expect(screen.getByText('Processing and saving game data...')).toBeInTheDocument();
    });
  });
});

