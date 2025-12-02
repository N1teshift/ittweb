import { render, screen } from '@testing-library/react';
import ArchivesContent from '../components/ArchivesContent';
import type { ArchiveEntry } from '@/types/archive';
import type { Game } from '@/features/modules/game-management/games/types';

// Mock TimelineSection
jest.mock('../../shared/components/sections/TimelineSection', () => ({
  __esModule: true,
  default: ({ title, entries, onEdit, onDelete, canDeleteEntry, onImageClick }: any) => (
    <div data-testid={`timeline-section-${title}`}>
      <h2>{title}</h2>
      {entries.map((entry: ArchiveEntry) => (
        <div key={entry.id} data-testid={`entry-${entry.id}`}>
          {entry.title}
          {onEdit && <button onClick={() => onEdit(entry)}>Edit</button>}
          {canDeleteEntry && canDeleteEntry(entry) && onDelete && (
            <button onClick={() => onDelete(entry)}>Delete</button>
          )}
          {onImageClick && <button onClick={() => onImageClick('image.jpg', entry.title)}>View Image</button>}
        </div>
      ))}
    </div>
  ),
}));

// Mock state components
jest.mock('../index', () => ({
  ArchivesEmptyState: ({ isAuthenticated, onAddClick, onSignInClick }: any) => (
    <div data-testid="empty-state">
      {isAuthenticated ? (
        <button onClick={onAddClick}>Add Entry</button>
      ) : (
        <button onClick={onSignInClick}>Sign In</button>
      )}
    </div>
  ),
  ArchivesLoadingState: () => <div data-testid="loading-state">Loading...</div>,
  ArchivesErrorState: ({ error }: { error: string }) => <div data-testid="error-state">{error}</div>,
}));

describe('ArchivesContent', () => {
  const mockOnEdit = jest.fn();
  const mockOnRequestDelete = jest.fn();
  const mockOnImageClick = jest.fn();
  const mockOnAddClick = jest.fn();
  const mockOnSignInClick = jest.fn();
  const mockCanDeleteEntry = jest.fn();

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
    mockCanDeleteEntry.mockReturnValue(false);
  });

  describe('renders loading state', () => {
    it('should render loading state when loading is true', () => {
      // Act
      render(
        <ArchivesContent
          loading={true}
          error={null}
          entries={[]}
          datedEntries={[]}
          undatedEntries={[]}
          isAuthenticated={false}
          canManageEntries={false}
          onEdit={mockOnEdit}
          onRequestDelete={mockOnRequestDelete}
          onImageClick={mockOnImageClick}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });

    it('should not render timeline when loading', () => {
      // Act
      render(
        <ArchivesContent
          loading={true}
          error={null}
          entries={[]}
          datedEntries={[]}
          undatedEntries={[]}
          isAuthenticated={false}
          canManageEntries={false}
          onEdit={mockOnEdit}
          onRequestDelete={mockOnRequestDelete}
          onImageClick={mockOnImageClick}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      expect(screen.queryByTestId('timeline-section-Timeline')).not.toBeInTheDocument();
    });
  });

  describe('renders error state', () => {
    it('should render error message when error is provided', () => {
      // Act
      render(
        <ArchivesContent
          loading={false}
          error="Failed to load archives"
          entries={[]}
          datedEntries={[]}
          undatedEntries={[]}
          isAuthenticated={false}
          canManageEntries={false}
          onEdit={mockOnEdit}
          onRequestDelete={mockOnRequestDelete}
          onImageClick={mockOnImageClick}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Failed to load archives')).toBeInTheDocument();
    });
  });

  describe('renders timeline sections', () => {
    it('should render Timeline section with dated entries', () => {
      // Arrange
      const datedEntry = {
        ...baseEntry,
        id: 'dated1',
        title: 'Dated Entry',
      };

      // Act
      render(
        <ArchivesContent
          loading={false}
          error={null}
          entries={[datedEntry]}
          datedEntries={[datedEntry]}
          undatedEntries={[]}
          isAuthenticated={false}
          canManageEntries={false}
          onEdit={mockOnEdit}
          onRequestDelete={mockOnRequestDelete}
          onImageClick={mockOnImageClick}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      expect(screen.getByTestId('timeline-section-Timeline')).toBeInTheDocument();
      expect(screen.getByText('Dated Entry')).toBeInTheDocument();
    });

    it('should render Undated Archives section with undated entries', () => {
      // Arrange
      const undatedEntry = {
        ...baseEntry,
        id: 'undated1',
        title: 'Undated Entry',
        dateInfo: {
          type: 'undated' as const,
          approximateText: 'Early 2024',
        },
      };

      // Act
      render(
        <ArchivesContent
          loading={false}
          error={null}
          entries={[undatedEntry]}
          datedEntries={[]}
          undatedEntries={[undatedEntry]}
          isAuthenticated={false}
          canManageEntries={false}
          onEdit={mockOnEdit}
          onRequestDelete={mockOnRequestDelete}
          onImageClick={mockOnImageClick}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      expect(screen.getByTestId('timeline-section-Undated Archives')).toBeInTheDocument();
      expect(screen.getByText('Undated Entry')).toBeInTheDocument();
    });
  });

  describe('handles authentication', () => {
    it('should pass onEdit to TimelineSection when authenticated', () => {
      // Arrange
      const datedEntry = {
        ...baseEntry,
        id: 'dated1',
      };

      // Act
      render(
        <ArchivesContent
          loading={false}
          error={null}
          entries={[datedEntry]}
          datedEntries={[datedEntry]}
          undatedEntries={[]}
          isAuthenticated={true}
          canManageEntries={false}
          onEdit={mockOnEdit}
          onRequestDelete={mockOnRequestDelete}
          onImageClick={mockOnImageClick}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('should not pass onEdit to TimelineSection when not authenticated', () => {
      // Arrange
      const datedEntry = {
        ...baseEntry,
        id: 'dated1',
      };

      // Act
      render(
        <ArchivesContent
          loading={false}
          error={null}
          entries={[datedEntry]}
          datedEntries={[datedEntry]}
          undatedEntries={[]}
          isAuthenticated={false}
          canManageEntries={false}
          onEdit={mockOnEdit}
          onRequestDelete={mockOnRequestDelete}
          onImageClick={mockOnImageClick}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
  });

  describe('handles delete permissions', () => {
    it('should allow delete when canManageEntries is true', () => {
      // Arrange
      const datedEntry = {
        ...baseEntry,
        id: 'dated1',
      };
      mockCanDeleteEntry.mockReturnValue(true);

      // Act
      render(
        <ArchivesContent
          loading={false}
          error={null}
          entries={[datedEntry]}
          datedEntries={[datedEntry]}
          undatedEntries={[]}
          isAuthenticated={true}
          canManageEntries={true}
          onEdit={mockOnEdit}
          onRequestDelete={mockOnRequestDelete}
          onImageClick={mockOnImageClick}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should use canDeleteEntry function when provided', () => {
      // Arrange
      const datedEntry = {
        ...baseEntry,
        id: 'dated1',
      };
      mockCanDeleteEntry.mockReturnValue(true);

      // Act
      render(
        <ArchivesContent
          loading={false}
          error={null}
          entries={[datedEntry]}
          datedEntries={[datedEntry]}
          undatedEntries={[]}
          isAuthenticated={true}
          canManageEntries={false}
          canDeleteEntry={mockCanDeleteEntry}
          onEdit={mockOnEdit}
          onRequestDelete={mockOnRequestDelete}
          onImageClick={mockOnImageClick}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      expect(mockCanDeleteEntry).toHaveBeenCalledWith(datedEntry);
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('renders empty state', () => {
    it('should render empty state when no entries and no games', () => {
      // Act
      render(
        <ArchivesContent
          loading={false}
          error={null}
          entries={[]}
          datedEntries={[]}
          undatedEntries={[]}
          games={[]}
          isAuthenticated={false}
          canManageEntries={false}
          onEdit={mockOnEdit}
          onRequestDelete={mockOnRequestDelete}
          onImageClick={mockOnImageClick}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should show sign in button when not authenticated', () => {
      // Act
      render(
        <ArchivesContent
          loading={false}
          error={null}
          entries={[]}
          datedEntries={[]}
          undatedEntries={[]}
          games={[]}
          isAuthenticated={false}
          canManageEntries={false}
          onEdit={mockOnEdit}
          onRequestDelete={mockOnRequestDelete}
          onImageClick={mockOnImageClick}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('should show add entry button when authenticated', () => {
      // Act
      render(
        <ArchivesContent
          loading={false}
          error={null}
          entries={[]}
          datedEntries={[]}
          undatedEntries={[]}
          games={[]}
          isAuthenticated={true}
          canManageEntries={false}
          onEdit={mockOnEdit}
          onRequestDelete={mockOnRequestDelete}
          onImageClick={mockOnImageClick}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      expect(screen.getByText('Add Entry')).toBeInTheDocument();
    });
  });

  describe('handles games without archives', () => {
    it('should merge games without archive entries into timeline', () => {
      // Arrange
      const game: Game = {
        id: 'game1',
        gameId: 1,
        gameState: 'completed',
        creatorName: 'Test Creator',
        datetime: '2024-01-20T00:00:00Z',
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z',
      };

      // Act
      render(
        <ArchivesContent
          loading={false}
          error={null}
          entries={[]}
          datedEntries={[]}
          undatedEntries={[]}
          games={[game]}
          isAuthenticated={false}
          canManageEntries={false}
          onEdit={mockOnEdit}
          onRequestDelete={mockOnRequestDelete}
          onImageClick={mockOnImageClick}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      // Games without archives should be added to the timeline
      expect(screen.getByTestId('timeline-section-Timeline')).toBeInTheDocument();
    });

    it('should not include games that already have archive entries', () => {
      // Arrange
      const game: Game = {
        id: 'game1',
        gameId: 1,
        gameState: 'completed',
        creatorName: 'Test Creator',
        datetime: '2024-01-20T00:00:00Z',
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z',
      };
      const entryWithLinkedGame = {
        ...baseEntry,
        id: 'entry1',
        linkedGameDocumentId: 'game1',
      };

      // Act
      render(
        <ArchivesContent
          loading={false}
          error={null}
          entries={[entryWithLinkedGame]}
          datedEntries={[entryWithLinkedGame]}
          undatedEntries={[]}
          games={[game]}
          isAuthenticated={false}
          canManageEntries={false}
          onEdit={mockOnEdit}
          onRequestDelete={mockOnRequestDelete}
          onImageClick={mockOnImageClick}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      // Only the archive entry should be shown, not the duplicate game
      const entries = screen.getAllByTestId(/^entry-/);
      expect(entries.length).toBe(1);
    });
  });
});



