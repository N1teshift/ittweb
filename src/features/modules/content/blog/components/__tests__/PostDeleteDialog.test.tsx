import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostDeleteDialog from '../PostDeleteDialog';

// Mock the modal accessibility hook
jest.mock('@/features/infrastructure/hooks/useModalAccessibility', () => ({
  useModalAccessibility: jest.fn(() => ({ current: null })),
}));

const mockUseModalAccessibility = require('@/features/infrastructure/hooks/useModalAccessibility').useModalAccessibility;

describe('PostDeleteDialog', () => {
  const defaultProps = {
    isOpen: true,
    postTitle: 'Test Post Title',
    isLoading: false,
    error: null,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseModalAccessibility.mockReturnValue({ current: null });
  });

  it('does not render when isOpen is false', () => {
    render(<PostDeleteDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog with post title when provided', () => {
    render(<PostDeleteDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Post?')).toBeInTheDocument();
    expect(screen.getByText('"Test Post Title" will be permanently deleted. This action cannot be undone.')).toBeInTheDocument();
  });

  it('renders dialog without post title when not provided', () => {
    render(<PostDeleteDialog {...defaultProps} postTitle={undefined} />);

    expect(screen.getByText('This post will be permanently deleted. This action cannot be undone.')).toBeInTheDocument();
  });

  it('renders error message when error is provided', () => {
    const errorMessage = 'Failed to delete post';
    render(<PostDeleteDialog {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('does not render error message when no error', () => {
    render(<PostDeleteDialog {...defaultProps} />);

    expect(screen.queryByText(/Failed to delete/)).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<PostDeleteDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<PostDeleteDialog {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isLoading is true', () => {
    render(<PostDeleteDialog {...defaultProps} isLoading={true} />);

    expect(screen.getByRole('button', { name: 'Deleting…' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Deleting…' })).toBeDisabled();
  });

  it('disables buttons when not loading', () => {
    render(<PostDeleteDialog {...defaultProps} isLoading={false} />);

    expect(screen.getByRole('button', { name: 'Delete' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled();
  });

  it('calls onCancel when backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<PostDeleteDialog {...defaultProps} />);

    // Find the backdrop element (the overlay that covers the entire screen)
    const backdrop = screen.getByTestId('backdrop'); // We'll need to add data-testid to the backdrop
    await user.click(backdrop);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(<PostDeleteDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'delete-dialog-title');

    expect(screen.getByText('Delete Post?')).toHaveAttribute('id', 'delete-dialog-title');
  });

  it('calls useModalAccessibility with correct parameters', () => {
    render(<PostDeleteDialog {...defaultProps} />);

    expect(mockUseModalAccessibility).toHaveBeenCalledWith({
      isOpen: true,
      onClose: defaultProps.onCancel,
      trapFocus: true,
      focusOnOpen: true,
    });
  });

  it('renders with correct styling classes', () => {
    const { container } = render(<PostDeleteDialog {...defaultProps} />);

    // Check for key styling classes
    expect(container.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();
    expect(container.querySelector('.bg-gray-900\\/95')).toBeInTheDocument();
    expect(container.querySelector('.border-amber-500\\/40')).toBeInTheDocument();
    expect(container.querySelector('.animate-scale-in')).toBeInTheDocument();
  });
});

