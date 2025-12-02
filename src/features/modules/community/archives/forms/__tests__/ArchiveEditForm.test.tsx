import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArchiveEditForm from '../components/ArchiveEditForm';
import type { ArchiveEntry } from '@/types/archive';

// Mock archiveService
const mockUpdateArchiveEntry = jest.fn();
jest.mock('@/features/infrastructure/lib/archiveService', () => ({
  updateArchiveEntry: (...args: any[]) => mockUpdateArchiveEntry(...args),
}));

// Mock ArchiveFormBase
jest.mock('../ArchiveFormBase', () => ({
  __esModule: true,
  default: ({ mode, initialEntry, onSubmit, onCancel, onSuccess }: any) => (
    <div data-testid="archive-form-base">
      <div>Mode: {mode}</div>
      <div>Entry ID: {initialEntry?.id}</div>
      <button onClick={() => onSubmit({ title: 'Updated', content: 'Updated Content' })}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onSuccess}>Success</button>
    </div>
  ),
}));

describe('ArchiveEditForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  const mockEntry: ArchiveEntry = {
    id: 'entry1',
    title: 'Original Title',
    content: 'Original Content',
    creatorName: 'Test Creator',
    dateInfo: {
      type: 'single',
      singleDate: '2024-01-15',
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders form', () => {
    it('should render ArchiveFormBase with edit mode', () => {
      // Act
      render(<ArchiveEditForm entry={mockEntry} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      // Assert
      expect(screen.getByTestId('archive-form-base')).toBeInTheDocument();
      expect(screen.getByText('Mode: edit')).toBeInTheDocument();
    });

    it('should pass initial entry to ArchiveFormBase', () => {
      // Act
      render(<ArchiveEditForm entry={mockEntry} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      // Assert
      expect(screen.getByText('Entry ID: entry1')).toBeInTheDocument();
    });
  });

  describe('handles form submission', () => {
    it('should call updateArchiveEntry with correct payload', async () => {
      // Arrange
      const user = userEvent.setup();
      mockUpdateArchiveEntry.mockResolvedValue(undefined);

      // Act
      render(<ArchiveEditForm entry={mockEntry} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      // Assert
      expect(mockUpdateArchiveEntry).toHaveBeenCalledWith(
        'entry1',
        expect.objectContaining({
          title: 'Updated',
          content: 'Updated Content',
        })
      );
    });

    it('should remove legacy fields from payload', async () => {
      // Arrange
      const user = userEvent.setup();
      mockUpdateArchiveEntry.mockResolvedValue(undefined);

      // Act
      render(<ArchiveEditForm entry={mockEntry} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      // Assert
      const callArgs = mockUpdateArchiveEntry.mock.calls[0];
      const payload = callArgs[1] as Record<string, unknown>;
      expect(payload).not.toHaveProperty('author');
      expect(payload).not.toHaveProperty('mediaUrl');
      expect(payload).not.toHaveProperty('mediaType');
    });
  });

  describe('handles callbacks', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<ArchiveEditForm entry={mockEntry} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onSuccess when success button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<ArchiveEditForm entry={mockEntry} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const successButton = screen.getByText('Success');
      await user.click(successButton);

      // Assert
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });
});



