import { act, renderHook, waitFor } from '@testing-library/react';
import { useArchivesActions } from '../useArchivesActions';
import type { ArchiveEntry } from '@/types/archive';

// Mock next-auth
const mockUseSession = jest.fn(() => ({ status: 'authenticated' }));
const mockSignIn = jest.fn();

jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

// Mock archiveService
const mockGetArchiveEntries = jest.fn();
const mockDeleteArchiveEntry = jest.fn();

jest.mock('@/features/infrastructure/lib/archiveService', () => ({
  getArchiveEntries: jest.fn(() => mockGetArchiveEntries()),
  deleteArchiveEntry: jest.fn((id: string) => mockDeleteArchiveEntry(id)),
  sortArchiveEntries: jest.fn((entries: ArchiveEntry[]) => entries),
}));

// Mock logging
jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: jest.fn(() => ({
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  })),
  logError: jest.fn(),
}));

describe('useArchivesActions', () => {
  const mockArchiveEntry: ArchiveEntry = {
    id: 'archive1',
    title: 'Test Archive',
    content: 'Test content',
    creatorName: 'Test Author',
    dateInfo: {
      type: 'single',
      singleDate: '2024-01-15',
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  };

  const mockSetEntries = jest.fn();
  const mockSetLoading = jest.fn();
  const mockSetError = jest.fn();
  const mockSetShowForm = jest.fn();
  const mockSetShowEditForm = jest.fn();
  const mockSetEditingEntry = jest.fn();
  const mockSetShowImageModal = jest.fn();
  const mockSetModalImage = jest.fn();
  const mockSetSortOrder = jest.fn();

  const defaultProps = {
    setEntries: mockSetEntries,
    setLoading: mockSetLoading,
    setError: mockSetError,
    setShowForm: mockSetShowForm,
    setShowEditForm: mockSetShowEditForm,
    setEditingEntry: mockSetEditingEntry,
    setShowImageModal: mockSetShowImageModal,
    setModalImage: mockSetModalImage,
    setSortOrder: mockSetSortOrder,
    entries: [],
    sortOrder: 'newest' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ status: 'authenticated' });
    mockGetArchiveEntries.mockResolvedValue([mockArchiveEntry]);
    mockDeleteArchiveEntry.mockResolvedValue(undefined);
  });

  describe('handles create action', () => {
    it('should reload entries after successful add', async () => {
      // Arrange
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      await act(async () => {
        result.current.handleAddSuccess();
      });

      // Assert
      await waitFor(() => {
        expect(mockSetShowForm).toHaveBeenCalledWith(false);
        expect(mockGetArchiveEntries).toHaveBeenCalled();
      });
    });

    it('should close form on cancel', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      act(() => {
        result.current.handleAddCancel();
      });

      // Assert
      expect(mockSetShowForm).toHaveBeenCalledWith(false);
    });
  });

  describe('handles update action', () => {
    it('should open edit form when authenticated', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      act(() => {
        result.current.handleEdit(mockArchiveEntry);
      });

      // Assert
      expect(mockSetEditingEntry).toHaveBeenCalledWith(mockArchiveEntry);
      expect(mockSetShowEditForm).toHaveBeenCalledWith(true);
    });

    it('should redirect to sign in when not authenticated', () => {
      // Arrange
      mockUseSession.mockReturnValueOnce({ status: 'unauthenticated' });
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      act(() => {
        result.current.handleEdit(mockArchiveEntry);
      });

      // Assert
      expect(mockSignIn).toHaveBeenCalledWith('discord');
      expect(mockSetEditingEntry).not.toHaveBeenCalled();
    });

    it('should reload entries after successful edit', async () => {
      // Arrange
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      await act(async () => {
        result.current.handleEditSuccess();
      });

      // Assert
      await waitFor(() => {
        expect(mockSetShowEditForm).toHaveBeenCalledWith(false);
        expect(mockSetEditingEntry).toHaveBeenCalledWith(null);
        expect(mockGetArchiveEntries).toHaveBeenCalled();
      });
    });

    it('should close edit form on cancel', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      act(() => {
        result.current.handleEditCancel();
      });

      // Assert
      expect(mockSetShowEditForm).toHaveBeenCalledWith(false);
      expect(mockSetEditingEntry).toHaveBeenCalledWith(null);
    });
  });

  describe('handles delete action', () => {
    it('should delete entry when authenticated', async () => {
      // Arrange
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      await act(async () => {
        await result.current.handleDelete(mockArchiveEntry);
      });

      // Assert
      await waitFor(() => {
        expect(mockSetLoading).toHaveBeenCalledWith(true);
        expect(mockDeleteArchiveEntry).toHaveBeenCalledWith('archive1');
        expect(mockGetArchiveEntries).toHaveBeenCalled();
        expect(mockSetLoading).toHaveBeenCalledWith(false);
      });
    });

    it('should redirect to sign in when not authenticated', async () => {
      // Arrange
      mockUseSession.mockReturnValueOnce({ status: 'unauthenticated' });
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      await act(async () => {
        await result.current.handleDelete(mockArchiveEntry);
      });

      // Assert
      expect(mockSignIn).toHaveBeenCalledWith('discord');
      expect(mockDeleteArchiveEntry).not.toHaveBeenCalled();
    });

    it('should handle delete errors', async () => {
      // Arrange
      mockDeleteArchiveEntry.mockRejectedValueOnce(new Error('Delete failed'));
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      await act(async () => {
        await result.current.handleDelete(mockArchiveEntry);
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith(
        'Failed to delete archive entry. Please try again.'
      );
      // logError is called internally, verify error state is set
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('handles data loading', () => {
    it('should load entries successfully', async () => {
      // Arrange
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      await act(async () => {
        await result.current.loadEntries();
      });

      // Assert
      await waitFor(() => {
        expect(mockSetLoading).toHaveBeenCalledWith(true);
        expect(mockSetError).toHaveBeenCalledWith(null);
        expect(mockGetArchiveEntries).toHaveBeenCalled();
        expect(mockSetEntries).toHaveBeenCalledWith([mockArchiveEntry]);
        expect(mockSetLoading).toHaveBeenCalledWith(false);
      });
    });

    it('should handle load errors', async () => {
      // Arrange
      mockGetArchiveEntries.mockRejectedValueOnce(new Error('Load failed'));
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      await act(async () => {
        await result.current.loadEntries();
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith(
        'Failed to load archives. Please try again later.'
      );
      // logError is called internally, verify error state is set
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });

    it('should reload entries', async () => {
      // Arrange
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      await act(async () => {
        await result.current.reloadEntries();
      });

      // Assert
      await waitFor(() => {
        expect(mockGetArchiveEntries).toHaveBeenCalled();
        expect(mockSetEntries).toHaveBeenCalledWith([mockArchiveEntry]);
      });
    });
  });

  describe('handles image modal actions', () => {
    it('should open image modal', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      act(() => {
        result.current.handleImageClick('https://example.com/image.jpg', 'Test Image');
      });

      // Assert
      expect(mockSetModalImage).toHaveBeenCalledWith({
        url: 'https://example.com/image.jpg',
        title: 'Test Image',
      });
      expect(mockSetShowImageModal).toHaveBeenCalledWith(true);
    });

    it('should close image modal', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      act(() => {
        result.current.handleImageModalClose();
      });

      // Assert
      expect(mockSetShowImageModal).toHaveBeenCalledWith(false);
      expect(mockSetModalImage).toHaveBeenCalledWith(null);
    });
  });

  describe('handles sorting actions', () => {
    it('should change sort order', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      act(() => {
        result.current.handleSortOrderChange('oldest');
      });

      // Assert
      expect(mockSetSortOrder).toHaveBeenCalledWith('oldest');
    });
  });

  describe('handles authentication actions', () => {
    it('should initiate sign in', () => {
      // Arrange
      const { result } = renderHook(() => useArchivesActions(defaultProps));

      // Act
      act(() => {
        result.current.handleSignIn();
      });

      // Assert
      expect(mockSignIn).toHaveBeenCalledWith('discord');
    });
  });
});



