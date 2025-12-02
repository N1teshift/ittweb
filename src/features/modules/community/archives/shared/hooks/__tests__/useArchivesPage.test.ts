import { act, renderHook } from '@testing-library/react';
import { useArchivesPage } from '../useArchivesPage';
import type { ArchiveEntry } from '@/types/archive';

// Mock archiveService
const mockSortArchiveEntries = jest.fn((entries: ArchiveEntry[], order: 'newest' | 'oldest') => entries);

jest.mock('@/features/infrastructure/lib/archiveService', () => ({
  sortArchiveEntries: jest.fn((entries: ArchiveEntry[], order: 'newest' | 'oldest') => 
    mockSortArchiveEntries(entries, order)
  ),
}));

describe('useArchivesPage', () => {
  const mockDatedEntry: ArchiveEntry = {
    id: 'archive1',
    title: 'Dated Archive',
    content: 'Content',
    creatorName: 'Author',
    dateInfo: {
      type: 'single',
      singleDate: '2024-01-15',
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  };

  const mockUndatedEntry: ArchiveEntry = {
    id: 'archive2',
    title: 'Undated Archive',
    content: 'Content',
    creatorName: 'Author',
    dateInfo: {
      type: 'undated',
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSortArchiveEntries.mockImplementation((entries) => entries);
  });

  describe('initializes state correctly', () => {
    it('should initialize with default values', () => {
      // Act
      const { result } = renderHook(() => useArchivesPage());

      // Assert
      expect(result.current.state.entries).toEqual([]);
      expect(result.current.state.unsortedEntries).toEqual([]);
      expect(result.current.state.loading).toBe(true);
      expect(result.current.state.error).toBeNull();
      expect(result.current.state.showForm).toBe(false);
      expect(result.current.state.showEditForm).toBe(false);
      expect(result.current.state.editingEntry).toBeNull();
      expect(result.current.state.showImageModal).toBe(false);
      expect(result.current.state.modalImage).toBeNull();
      expect(result.current.state.sortOrder).toBe('newest');
    });
  });

  describe('handles state updates', () => {
    it('should update entries', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());

      // Act
      act(() => {
        result.current.setEntries([mockDatedEntry, mockUndatedEntry]);
      });

      // Assert
      expect(result.current.state.unsortedEntries).toEqual([mockDatedEntry, mockUndatedEntry]);
      expect(mockSortArchiveEntries).toHaveBeenCalled();
    });

    it('should update loading state', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());

      // Act
      act(() => {
        result.current.setLoading(false);
      });

      // Assert
      expect(result.current.state.loading).toBe(false);
    });

    it('should update error state', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());

      // Act
      act(() => {
        result.current.setError('Test error');
      });

      // Assert
      expect(result.current.state.error).toBe('Test error');
    });

    it('should update showForm state', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());

      // Act
      act(() => {
        result.current.setShowForm(true);
      });

      // Assert
      expect(result.current.state.showForm).toBe(true);
    });

    it('should update showEditForm state', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());

      // Act
      act(() => {
        result.current.setShowEditForm(true);
      });

      // Assert
      expect(result.current.state.showEditForm).toBe(true);
    });

    it('should update editingEntry state', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());

      // Act
      act(() => {
        result.current.setEditingEntry(mockDatedEntry);
      });

      // Assert
      expect(result.current.state.editingEntry).toBe(mockDatedEntry);
    });

    it('should update showImageModal state', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());

      // Act
      act(() => {
        result.current.setShowImageModal(true);
      });

      // Assert
      expect(result.current.state.showImageModal).toBe(true);
    });

    it('should update modalImage state', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());
      const modalImage = { url: 'https://example.com/image.jpg', title: 'Test Image' };

      // Act
      act(() => {
        result.current.setModalImage(modalImage);
      });

      // Assert
      expect(result.current.state.modalImage).toEqual(modalImage);
    });

    it('should update sortOrder state', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());

      // Act
      act(() => {
        result.current.setSortOrder('oldest');
      });

      // Assert
      expect(result.current.state.sortOrder).toBe('oldest');
    });
  });

  describe('computes sorted entries', () => {
    it('should sort entries when unsortedEntries change', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());

      // Act
      act(() => {
        result.current.setEntries([mockDatedEntry, mockUndatedEntry]);
      });

      // Assert
      expect(mockSortArchiveEntries).toHaveBeenCalled();
    });

    it('should re-sort when sortOrder changes', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());

      act(() => {
        result.current.setEntries([mockDatedEntry, mockUndatedEntry]);
      });

      // Act
      act(() => {
        result.current.setSortOrder('oldest');
      });

      // Assert
      expect(mockSortArchiveEntries).toHaveBeenCalled();
    });
  });

  describe('computes dated and undated entries', () => {
    it('should filter dated entries', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());

      act(() => {
        result.current.setEntries([mockDatedEntry, mockUndatedEntry]);
      });

      // Assert
      expect(result.current.datedEntries).toEqual([mockDatedEntry]);
      expect(result.current.datedEntries.length).toBe(1);
    });

    it('should filter undated entries', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());

      act(() => {
        result.current.setEntries([mockDatedEntry, mockUndatedEntry]);
      });

      // Assert
      expect(result.current.undatedEntries).toEqual([mockUndatedEntry]);
      expect(result.current.undatedEntries.length).toBe(1);
    });

    it('should return empty arrays when no entries', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());

      // Assert
      expect(result.current.datedEntries).toEqual([]);
      expect(result.current.undatedEntries).toEqual([]);
    });
  });

  describe('utility functions', () => {
    it('should reset error', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());

      act(() => {
        result.current.setError('Test error');
      });

      // Act
      act(() => {
        result.current.resetError();
      });

      // Assert
      expect(result.current.state.error).toBeNull();
    });

    it('should reset all form states', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesPage());

      act(() => {
        result.current.setShowForm(true);
        result.current.setShowEditForm(true);
        result.current.setEditingEntry(mockDatedEntry);
        result.current.setShowImageModal(true);
        result.current.setModalImage({ url: 'test.jpg', title: 'Test' });
      });

      // Act
      act(() => {
        result.current.resetFormStates();
      });

      // Assert
      expect(result.current.state.showForm).toBe(false);
      expect(result.current.state.showEditForm).toBe(false);
      expect(result.current.state.editingEntry).toBeNull();
      expect(result.current.state.showImageModal).toBe(false);
      expect(result.current.state.modalImage).toBeNull();
    });
  });
});



