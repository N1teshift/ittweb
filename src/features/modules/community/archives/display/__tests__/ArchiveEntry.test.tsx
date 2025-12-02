import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArchiveEntry } from '../components';
import type { ArchiveEntry as ArchiveEntryType } from '@/types/archive';

// Mock useGame hook
const mockGame = {
  id: 'game1',
  gameId: '1',
  datetime: '2024-01-15T10:30:00Z',
  players: [],
  category: 'test',
  creatorName: 'Test Creator',
  ownername: 'Test Owner',
};

const mockUseGame = jest.fn();
jest.mock('@/features/modules/game-management/games/hooks/useGame', () => ({
  useGame: (...args: any[]) => mockUseGame(...args),
}));

// Mock GameLinkedArchiveEntry and NormalArchiveEntry
jest.mock('../GameLinkedArchiveEntry', () => ({
  GameLinkedArchiveEntry: ({ entry, game, gameLoading, gameError, onEdit, onDelete, canDelete, onImageClick, displayText, shouldTruncate, isExpanded, onTextExpand }: any) => (
    <div data-testid="game-linked-entry">
      <div>Game Entry: {entry.title}</div>
      {game && <div>Game: {game.gameId}</div>}
      {gameLoading && <div>Loading...</div>}
      {gameError && <div>Error: {gameError}</div>}
      {onEdit && <button onClick={() => onEdit(entry)}>Edit</button>}
      {onDelete && canDelete && <button onClick={() => onDelete(entry)}>Delete</button>}
      {onImageClick && <button onClick={() => onImageClick('image.jpg', entry.title)}>Click Image</button>}
      <div>{displayText}</div>
      {shouldTruncate && onTextExpand && (
        <button onClick={onTextExpand}>{isExpanded ? 'Show Less' : 'Show More'}</button>
      )}
    </div>
  ),
}));

jest.mock('../NormalArchiveEntry', () => ({
  NormalArchiveEntry: ({ entry, onEdit, onDelete, canDelete, onImageClick, displayText, shouldTruncate, isExpanded, onTextExpand }: any) => (
    <div data-testid="normal-entry">
      <div>Normal Entry: {entry.title}</div>
      {onEdit && <button onClick={() => onEdit(entry)}>Edit</button>}
      {onDelete && canDelete && <button onClick={() => onDelete(entry)}>Delete</button>}
      {onImageClick && <button onClick={() => onImageClick('image.jpg', entry.title)}>Click Image</button>}
      <div>{displayText}</div>
      {shouldTruncate && onTextExpand && (
        <button onClick={onTextExpand}>{isExpanded ? 'Show Less' : 'Show More'}</button>
      )}
    </div>
  ),
}));

// Mock fetch for game lookup
global.fetch = jest.fn();

describe('ArchiveEntry', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnImageClick = jest.fn();

  const baseEntry: ArchiveEntryType = {
    id: 'entry1',
    title: 'Test Entry',
    content: 'Short content',
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
    mockUseGame.mockReturnValue({
      game: null,
      loading: false,
      error: null,
    });
    (global.fetch as jest.Mock).mockClear();
  });

  describe('renders normal entry', () => {
    it('should render NormalArchiveEntry when no linked game', () => {
      // Act
      render(
        <ArchiveEntry
          entry={baseEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          canDelete={true}
          onImageClick={mockOnImageClick}
        />
      );

      // Assert
      expect(screen.getByTestId('normal-entry')).toBeInTheDocument();
      expect(screen.getByText('Normal Entry: Test Entry')).toBeInTheDocument();
    });

    it('should not truncate short content', () => {
      // Act
      render(
        <ArchiveEntry
          entry={baseEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          canDelete={true}
          onImageClick={mockOnImageClick}
        />
      );

      // Assert
      expect(screen.queryByText('Show More')).not.toBeInTheDocument();
    });

    it('should truncate long content', () => {
      // Arrange
      const longContent = 'a'.repeat(400);
      const entryWithLongContent = {
        ...baseEntry,
        content: longContent,
      };

      // Act
      render(
        <ArchiveEntry
          entry={entryWithLongContent}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          canDelete={true}
          onImageClick={mockOnImageClick}
        />
      );

      // Assert
      expect(screen.getByText('Show More')).toBeInTheDocument();
    });
  });

  describe('renders game-linked entry', () => {
    it('should render GameLinkedArchiveEntry when linkedGameDocumentId exists', () => {
      // Arrange
      const entryWithLinkedGame = {
        ...baseEntry,
        linkedGameDocumentId: 'game1',
      };
      mockUseGame.mockReturnValue({
        game: mockGame,
        loading: false,
        error: null,
      });

      // Act
      render(
        <ArchiveEntry
          entry={entryWithLinkedGame}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          canDelete={true}
          onImageClick={mockOnImageClick}
        />
      );

      // Assert
      expect(screen.getByTestId('game-linked-entry')).toBeInTheDocument();
    });

    it('should render GameLinkedArchiveEntry for scheduled game archive', () => {
      // Arrange
      const scheduledGameEntry = {
        ...baseEntry,
        title: 'Game #123',
      };
      mockUseGame.mockReturnValue({
        game: mockGame,
        loading: false,
        error: null,
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: { games: [{ id: 'game123', gameId: '123' }] },
        }),
      });

      // Act
      render(
        <ArchiveEntry
          entry={scheduledGameEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          canDelete={true}
          onImageClick={mockOnImageClick}
        />
      );

      // Assert
      // Should eventually render game-linked entry after finding the game
      waitFor(() => {
        expect(screen.getByTestId('game-linked-entry')).toBeInTheDocument();
      });
    });
  });

  describe('handles text expansion', () => {
    it('should expand text when Show More is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const longContent = 'a'.repeat(400);
      const entryWithLongContent = {
        ...baseEntry,
        content: longContent,
      };

      // Act
      render(
        <ArchiveEntry
          entry={entryWithLongContent}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          canDelete={true}
          onImageClick={mockOnImageClick}
        />
      );

      const expandButton = screen.getByText('Show More');
      await user.click(expandButton);

      // Assert
      expect(screen.getByText('Show Less')).toBeInTheDocument();
    });
  });

  describe('handles edit action', () => {
    it('should call onEdit when edit button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(
        <ArchiveEntry
          entry={baseEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          canDelete={true}
          onImageClick={mockOnImageClick}
        />
      );

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      // Assert
      expect(mockOnEdit).toHaveBeenCalledWith(baseEntry);
    });
  });

  describe('handles delete action', () => {
    it('should call onDelete when delete button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(
        <ArchiveEntry
          entry={baseEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          canDelete={true}
          onImageClick={mockOnImageClick}
        />
      );

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Assert
      expect(mockOnDelete).toHaveBeenCalledWith(baseEntry);
    });

    it('should not show delete button when canDelete is false', () => {
      // Act
      render(
        <ArchiveEntry
          entry={baseEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          canDelete={false}
          onImageClick={mockOnImageClick}
        />
      );

      // Assert
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });

  describe('handles image clicks', () => {
    it('should call onImageClick when image is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(
        <ArchiveEntry
          entry={baseEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          canDelete={true}
          onImageClick={mockOnImageClick}
        />
      );

      const imageButton = screen.getByText('Click Image');
      await user.click(imageButton);

      // Assert
      expect(mockOnImageClick).toHaveBeenCalledWith('image.jpg', 'Test Entry');
    });
  });

  describe('handles game loading states', () => {
    it('should show loading state when game is loading', () => {
      // Arrange
      const entryWithLinkedGame = {
        ...baseEntry,
        linkedGameDocumentId: 'game1',
      };
      mockUseGame.mockReturnValue({
        game: null,
        loading: true,
        error: null,
      });

      // Act
      render(
        <ArchiveEntry
          entry={entryWithLinkedGame}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          canDelete={true}
          onImageClick={mockOnImageClick}
        />
      );

      // Assert
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show error state when game loading fails', () => {
      // Arrange
      const entryWithLinkedGame = {
        ...baseEntry,
        linkedGameDocumentId: 'game1',
      };
      mockUseGame.mockReturnValue({
        game: null,
        loading: false,
        error: { message: 'Failed to load game' },
      });

      // Act
      render(
        <ArchiveEntry
          entry={entryWithLinkedGame}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          canDelete={true}
          onImageClick={mockOnImageClick}
        />
      );

      // Assert
      expect(screen.getByText(/Error: Failed to load game/i)).toBeInTheDocument();
    });
  });
});



