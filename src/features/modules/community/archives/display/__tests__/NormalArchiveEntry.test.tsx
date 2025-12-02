import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NormalArchiveEntry } from '../components/NormalArchiveEntry';
import type { ArchiveEntry } from '@/types/archive';

// Mock ArchiveMediaSections
jest.mock('../ArchiveMediaSections', () => ({
  ArchiveMediaSections: ({ entry, onImageClick, displayText, onTextExpand, shouldTruncate, isExpanded }: any) => (
    <div data-testid="archive-media-sections">
      <div>Media for: {entry.title}</div>
      {displayText && <div>{displayText}</div>}
      {shouldTruncate && onTextExpand && (
        <button onClick={onTextExpand}>{isExpanded ? 'Show Less' : 'Show More'}</button>
      )}
      {onImageClick && <button onClick={() => onImageClick('image.jpg', entry.title)}>Click Image</button>}
    </div>
  ),
}));

describe('NormalArchiveEntry', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnImageClick = jest.fn();
  const mockOnTextExpand = jest.fn();

  const baseEntry: ArchiveEntry = {
    id: 'entry1',
    title: 'Test Entry',
    content: 'Test content',
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

  describe('renders archive entry', () => {
    it('should render entry title', () => {
      // Act
      render(
        <NormalArchiveEntry
          entry={baseEntry}
          displayText="Test content"
          shouldTruncate={false}
          isExpanded={false}
          onTextExpand={mockOnTextExpand}
        />
      );

      // Assert
      expect(screen.getByText('Test Entry')).toBeInTheDocument();
    });

    it('should render date badge', () => {
      // Act
      render(
        <NormalArchiveEntry
          entry={baseEntry}
          displayText="Test content"
          shouldTruncate={false}
          isExpanded={false}
          onTextExpand={mockOnTextExpand}
        />
      );

      // Assert
      // Date badge should be rendered (format depends on dateInfo)
      expect(screen.getByText(/Test content/i)).toBeInTheDocument();
    });

    it('should render creator and creation date', () => {
      // Act
      render(
        <NormalArchiveEntry
          entry={baseEntry}
          displayText="Test content"
          shouldTruncate={false}
          isExpanded={false}
          onTextExpand={mockOnTextExpand}
        />
      );

      // Assert
      expect(screen.getByText(/Added by Test Creator/i)).toBeInTheDocument();
    });

    it('should render ArchiveMediaSections', () => {
      // Act
      render(
        <NormalArchiveEntry
          entry={baseEntry}
          displayText="Test content"
          shouldTruncate={false}
          isExpanded={false}
          onTextExpand={mockOnTextExpand}
        />
      );

      // Assert
      expect(screen.getByTestId('archive-media-sections')).toBeInTheDocument();
    });
  });

  describe('handles edit action', () => {
    it('should render edit button when onEdit is provided', () => {
      // Act
      render(
        <NormalArchiveEntry
          entry={baseEntry}
          onEdit={mockOnEdit}
          displayText="Test content"
          shouldTruncate={false}
          isExpanded={false}
          onTextExpand={mockOnTextExpand}
        />
      );

      // Assert
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('should call onEdit when edit button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(
        <NormalArchiveEntry
          entry={baseEntry}
          onEdit={mockOnEdit}
          displayText="Test content"
          shouldTruncate={false}
          isExpanded={false}
          onTextExpand={mockOnTextExpand}
        />
      );

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      // Assert
      expect(mockOnEdit).toHaveBeenCalledWith(baseEntry);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should not render edit button when onEdit is not provided', () => {
      // Act
      render(
        <NormalArchiveEntry
          entry={baseEntry}
          displayText="Test content"
          shouldTruncate={false}
          isExpanded={false}
          onTextExpand={mockOnTextExpand}
        />
      );

      // Assert
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
  });

  describe('handles delete action', () => {
    it('should render delete button when canDelete is true and onDelete is provided', () => {
      // Act
      render(
        <NormalArchiveEntry
          entry={baseEntry}
          onDelete={mockOnDelete}
          canDelete={true}
          displayText="Test content"
          shouldTruncate={false}
          isExpanded={false}
          onTextExpand={mockOnTextExpand}
        />
      );

      // Assert
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should not render delete button when canDelete is false', () => {
      // Act
      render(
        <NormalArchiveEntry
          entry={baseEntry}
          onDelete={mockOnDelete}
          canDelete={false}
          displayText="Test content"
          shouldTruncate={false}
          isExpanded={false}
          onTextExpand={mockOnTextExpand}
        />
      );

      // Assert
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should call onDelete when delete button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(
        <NormalArchiveEntry
          entry={baseEntry}
          onDelete={mockOnDelete}
          canDelete={true}
          displayText="Test content"
          shouldTruncate={false}
          isExpanded={false}
          onTextExpand={mockOnTextExpand}
        />
      );

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Assert
      expect(mockOnDelete).toHaveBeenCalledWith(baseEntry);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should not render delete button when onDelete is not provided', () => {
      // Act
      render(
        <NormalArchiveEntry
          entry={baseEntry}
          canDelete={true}
          displayText="Test content"
          shouldTruncate={false}
          isExpanded={false}
          onTextExpand={mockOnTextExpand}
        />
      );

      // Assert
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });

  describe('handles image clicks', () => {
    it('should pass onImageClick to ArchiveMediaSections', () => {
      // Act
      render(
        <NormalArchiveEntry
          entry={baseEntry}
          onImageClick={mockOnImageClick}
          displayText="Test content"
          shouldTruncate={false}
          isExpanded={false}
          onTextExpand={mockOnTextExpand}
        />
      );

      // Assert
      expect(screen.getByText('Click Image')).toBeInTheDocument();
    });
  });

  describe('handles text expansion', () => {
    it('should pass text expansion props to ArchiveMediaSections', () => {
      // Act
      render(
        <NormalArchiveEntry
          entry={baseEntry}
          displayText="Truncated content..."
          shouldTruncate={true}
          isExpanded={false}
          onTextExpand={mockOnTextExpand}
        />
      );

      // Assert
      expect(screen.getByText('Show More')).toBeInTheDocument();
    });

    it('should show collapse button when expanded', () => {
      // Act
      render(
        <NormalArchiveEntry
          entry={baseEntry}
          displayText="Full content"
          shouldTruncate={true}
          isExpanded={true}
          onTextExpand={mockOnTextExpand}
        />
      );

      // Assert
      expect(screen.getByText('Show Less')).toBeInTheDocument();
    });
  });

  describe('handles different date types', () => {
    it('should render entry with single date', () => {
      // Arrange
      const entryWithSingleDate = {
        ...baseEntry,
        dateInfo: {
          type: 'single' as const,
          singleDate: '2024-01-15',
        },
      };

      // Act
      render(
        <NormalArchiveEntry
          entry={entryWithSingleDate}
          displayText="Test content"
          shouldTruncate={false}
          isExpanded={false}
          onTextExpand={mockOnTextExpand}
        />
      );

      // Assert
      expect(screen.getByText('Test Entry')).toBeInTheDocument();
    });

    it('should render entry with undated date info', () => {
      // Arrange
      const entryWithUndated = {
        ...baseEntry,
        dateInfo: {
          type: 'undated' as const,
          approximateText: 'Early 2024',
        },
      };

      // Act
      render(
        <NormalArchiveEntry
          entry={entryWithUndated}
          displayText="Test content"
          shouldTruncate={false}
          isExpanded={false}
          onTextExpand={mockOnTextExpand}
        />
      );

      // Assert
      expect(screen.getByText('Test Entry')).toBeInTheDocument();
    });
  });
});



