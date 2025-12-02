import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArchivesToolbar from '../components/ArchivesToolbar';
import type { GameFilters } from '@/features/modules/game-management/games/types';

// Mock SortToggle
jest.mock('../components/sections/SortToggle', () => {
  return function SortToggle({ sortOrder, onChange }: { sortOrder: 'newest' | 'oldest'; onChange: (order: 'newest' | 'oldest') => void }) {
    return (
      <div data-testid="sort-toggle">
        <button onClick={() => onChange('newest')}>Newest</button>
        <button onClick={() => onChange('oldest')}>Oldest</button>
      </div>
    );
  };
});

describe('ArchivesToolbar', () => {
  const mockOnAddClick = jest.fn();
  const mockOnSignInClick = jest.fn();
  const mockOnSortOrderChange = jest.fn();
  const mockOnFiltersChange = jest.fn();

  const defaultFilters: GameFilters = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders toolbar', () => {
    it('should show sign in button when not authenticated', () => {
      // Act
      render(
        <ArchivesToolbar
          isAuthenticated={false}
          entriesCount={10}
          sortOrder="newest"
          filters={defaultFilters}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
          onSortOrderChange={mockOnSortOrderChange}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Assert
      expect(screen.getByText(/Sign in with Discord/i)).toBeInTheDocument();
      expect(screen.queryByText('Become an Archivist')).not.toBeInTheDocument();
    });

    it('should show add button when authenticated', () => {
      // Act
      render(
        <ArchivesToolbar
          isAuthenticated={true}
          entriesCount={10}
          sortOrder="newest"
          filters={defaultFilters}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
          onSortOrderChange={mockOnSortOrderChange}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Assert
      expect(screen.getByText('Become an Archivist')).toBeInTheDocument();
      expect(screen.queryByText(/Sign in with Discord/i)).not.toBeInTheDocument();
    });

    it('should show sort toggle when entries count > 0', () => {
      // Act
      render(
        <ArchivesToolbar
          isAuthenticated={false}
          entriesCount={5}
          sortOrder="newest"
          filters={defaultFilters}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
          onSortOrderChange={mockOnSortOrderChange}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Assert
      expect(screen.getByTestId('sort-toggle')).toBeInTheDocument();
    });

    it('should not show sort toggle when entries count is 0', () => {
      // Act
      render(
        <ArchivesToolbar
          isAuthenticated={false}
          entriesCount={0}
          sortOrder="newest"
          filters={defaultFilters}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
          onSortOrderChange={mockOnSortOrderChange}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Assert
      expect(screen.queryByTestId('sort-toggle')).not.toBeInTheDocument();
    });
  });

  describe('handles user interactions', () => {
    it('should call onAddClick when add button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ArchivesToolbar
          isAuthenticated={true}
          entriesCount={10}
          sortOrder="newest"
          filters={defaultFilters}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
          onSortOrderChange={mockOnSortOrderChange}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Act
      const addButton = screen.getByText('Become an Archivist');
      await user.click(addButton);

      // Assert
      expect(mockOnAddClick).toHaveBeenCalledTimes(1);
    });

    it('should call onSignInClick when sign in button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ArchivesToolbar
          isAuthenticated={false}
          entriesCount={10}
          sortOrder="newest"
          filters={defaultFilters}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
          onSortOrderChange={mockOnSortOrderChange}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Act
      const signInButton = screen.getByText(/Sign in with Discord/i);
      await user.click(signInButton);

      // Assert
      expect(mockOnSignInClick).toHaveBeenCalledTimes(1);
    });

    it('should toggle filters panel when filters button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ArchivesToolbar
          isAuthenticated={false}
          entriesCount={10}
          sortOrder="newest"
          filters={defaultFilters}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
          onSortOrderChange={mockOnSortOrderChange}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Act
      const filtersButton = screen.getByText('Filters');
      await user.click(filtersButton);

      // Assert
      expect(screen.getByPlaceholderText(/e.g., 1v1, 2v2/i)).toBeInTheDocument();
    });
  });

  describe('handles filters', () => {
    it('should show active filters indicator when filters are active', () => {
      // Arrange
      const filtersWithCategory: GameFilters = { category: '1v1' };

      // Act
      render(
        <ArchivesToolbar
          isAuthenticated={false}
          entriesCount={10}
          sortOrder="newest"
          filters={filtersWithCategory}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
          onSortOrderChange={mockOnSortOrderChange}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Assert
      expect(screen.getByText(/Filters ●/i)).toBeInTheDocument();
    });

    it('should call onFiltersChange when filter input changes', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ArchivesToolbar
          isAuthenticated={false}
          entriesCount={10}
          sortOrder="newest"
          filters={defaultFilters}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
          onSortOrderChange={mockOnSortOrderChange}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Act - Open filters
      const filtersButton = screen.getByText('Filters');
      await user.click(filtersButton);

      // Act - Change category filter
      const categoryInput = screen.getByPlaceholderText(/e.g., 1v1, 2v2/i);
      await user.type(categoryInput, '1v1');

      // Assert
      expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('should show clear filters button when filters are active', async () => {
      // Arrange
      const user = userEvent.setup();
      const filtersWithCategory: GameFilters = { category: '1v1' };
      render(
        <ArchivesToolbar
          isAuthenticated={false}
          entriesCount={10}
          sortOrder="newest"
          filters={filtersWithCategory}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
          onSortOrderChange={mockOnSortOrderChange}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Act - Open filters
      const filtersButton = screen.getByText(/Filters/i);
      await user.click(filtersButton);

      // Assert
      expect(screen.getByText('Clear all filters')).toBeInTheDocument();
    });

    it('should clear filters when clear button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const filtersWithCategory: GameFilters = { category: '1v1' };
      render(
        <ArchivesToolbar
          isAuthenticated={false}
          entriesCount={10}
          sortOrder="newest"
          filters={filtersWithCategory}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
          onSortOrderChange={mockOnSortOrderChange}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Act - Open filters
      const filtersButton = screen.getByText(/Filters/i);
      await user.click(filtersButton);

      // Act - Clear filters
      const clearButton = screen.getByText('Clear all filters');
      await user.click(clearButton);

      // Assert
      expect(mockOnFiltersChange).toHaveBeenCalledWith({});
    });
  });

  describe('handles sort order', () => {
    it('should call onSortOrderChange when sort toggle changes', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ArchivesToolbar
          isAuthenticated={false}
          entriesCount={10}
          sortOrder="newest"
          filters={defaultFilters}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
          onSortOrderChange={mockOnSortOrderChange}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      // Act
      const oldestButton = screen.getByText('Oldest');
      await user.click(oldestButton);

      // Assert
      expect(mockOnSortOrderChange).toHaveBeenCalledWith('oldest');
    });
  });
});



