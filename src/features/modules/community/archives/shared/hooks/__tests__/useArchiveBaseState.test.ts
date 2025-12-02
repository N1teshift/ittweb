import { act, renderHook } from '@testing-library/react';
import { useArchiveBaseState } from '../useArchiveBaseState';
import type { ArchiveEntry } from '@/types/archive';

// Mock archiveFormUtils
jest.mock('../../utils/archiveFormUtils', () => ({
  extractFilenameFromUrl: jest.fn((url: string) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  }),
  normalizeSectionOrder: jest.fn((order?: string[]) => {
    return order || ['text', 'images', 'video', 'twitch', 'replay', 'game'];
  }),
}));

describe('useArchiveBaseState', () => {
  const mockArchiveEntry: ArchiveEntry = {
    id: 'archive1',
    title: 'Test Archive',
    content: 'Test content',
    creatorName: 'Test Author',
    entryType: 'story',
    videoUrl: 'https://example.com/video.mp4',
    twitchClipUrl: 'https://twitch.tv/clip/test',
    replayUrl: 'https://example.com/replay.w3g',
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    dateInfo: {
      type: 'single',
      singleDate: '2024-01-15',
      approximateText: '',
    },
    sectionOrder: ['text', 'images', 'video'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  };

  describe('initializes state correctly', () => {
    it('should initialize with defaults in create mode', () => {
      // Act
      const { result } = renderHook(() => useArchiveBaseState('create'));

      // Assert
      expect(result.current.formData.title).toBe('');
      expect(result.current.formData.content).toBe('');
      expect(result.current.formData.author).toBe('');
      expect(result.current.formData.entryType).toBe('');
      expect(result.current.formData.mediaUrl).toBe('');
      expect(result.current.formData.twitchClipUrl).toBe('');
      expect(result.current.formData.mediaType).toBe('none');
      expect(result.current.formData.dateType).toBe('single');
      expect(result.current.imageFile).toBeNull();
      expect(result.current.imageFiles).toEqual([]);
      expect(result.current.replayFile).toBeNull();
      expect(result.current.currentImages).toEqual([]);
      expect(result.current.sectionOrder).toBeDefined();
      expect(result.current.existingReplayUrl).toBe('');
    });

    it('should initialize with entry data in edit mode', () => {
      // Act
      const { result } = renderHook(() =>
        useArchiveBaseState('edit', mockArchiveEntry)
      );

      // Assert
      expect(result.current.formData.title).toBe('Test Archive');
      expect(result.current.formData.content).toBe('Test content');
      expect(result.current.formData.author).toBe('Test Author');
      expect(result.current.formData.entryType).toBe('story');
      expect(result.current.formData.mediaUrl).toBe('https://example.com/video.mp4');
      expect(result.current.formData.twitchClipUrl).toBe('https://twitch.tv/clip/test');
      expect(result.current.formData.mediaType).toBe('video');
      expect(result.current.currentImages).toEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ]);
      expect(result.current.existingReplayUrl).toBe('https://example.com/replay.w3g');
    });

    it('should handle missing optional fields', () => {
      // Arrange
      const minimalEntry: ArchiveEntry = {
        id: 'archive2',
        title: 'Minimal Archive',
        content: 'Content',
        creatorName: 'Author',
        dateInfo: {
          type: 'single',
          singleDate: '2024-01-15',
        },
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      };

      // Act
      const { result } = renderHook(() =>
        useArchiveBaseState('edit', minimalEntry)
      );

      // Assert
      expect(result.current.formData.title).toBe('Minimal Archive');
      expect(result.current.formData.entryType).toBe('');
      expect(result.current.formData.mediaUrl).toBe('');
      expect(result.current.formData.mediaType).toBe('none');
      expect(result.current.currentImages).toEqual([]);
    });
  });

  describe('handles form field updates', () => {
    it('should update form data when setFormData is called', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveBaseState('create'));

      // Act
      act(() => {
        result.current.setFormData((prev) => ({
          ...prev,
          title: 'Updated Title',
          content: 'Updated Content',
        }));
      });

      // Assert
      expect(result.current.formData.title).toBe('Updated Title');
      expect(result.current.formData.content).toBe('Updated Content');
    });

    it('should handle rapid updates', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveBaseState('create'));

      // Act
      act(() => {
        result.current.setFormData((prev) => ({ ...prev, title: 'Title 1' }));
        result.current.setFormData((prev) => ({ ...prev, title: 'Title 2' }));
        result.current.setFormData((prev) => ({ ...prev, title: 'Title 3' }));
      });

      // Assert
      expect(result.current.formData.title).toBe('Title 3');
    });
  });

  describe('handles section management', () => {
    it('should initialize with default section order', () => {
      // Act
      const { result } = renderHook(() => useArchiveBaseState('create'));

      // Assert
      expect(result.current.sectionOrder).toBeDefined();
      expect(Array.isArray(result.current.sectionOrder)).toBe(true);
    });

    it('should update section order', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveBaseState('create'));
      const newOrder: Array<'images' | 'video' | 'twitch' | 'replay' | 'game' | 'text'> = ['images', 'text', 'video'];

      // Act
      act(() => {
        result.current.setSectionOrder(newOrder);
      });

      // Assert
      expect(result.current.sectionOrder).toEqual(newOrder);
    });

    it('should use entry section order in edit mode', () => {
      // Act
      const { result } = renderHook(() =>
        useArchiveBaseState('edit', mockArchiveEntry)
      );

      // Assert
      expect(result.current.sectionOrder).toEqual(['text', 'images', 'video']);
    });
  });

  describe('handles media management', () => {
    it('should update image file', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveBaseState('create'));
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      // Act
      act(() => {
        result.current.setImageFile(mockFile);
      });

      // Assert
      expect(result.current.imageFile).toBe(mockFile);
    });

    it('should update image files array', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveBaseState('create'));
      const mockFiles = [
        new File(['content1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];

      // Act
      act(() => {
        result.current.setImageFiles(mockFiles);
      });

      // Assert
      expect(result.current.imageFiles).toEqual(mockFiles);
    });

    it('should update replay file', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveBaseState('create'));
      const mockFile = new File(['content'], 'replay.w3g', { type: 'application/octet-stream' });

      // Act
      act(() => {
        result.current.setReplayFile(mockFile);
      });

      // Assert
      expect(result.current.replayFile).toBe(mockFile);
    });

    it('should update current images', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveBaseState('create'));
      const images = ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'];

      // Act
      act(() => {
        result.current.setCurrentImages(images);
      });

      // Assert
      expect(result.current.currentImages).toEqual(images);
    });

    it('should initialize with entry images in edit mode', () => {
      // Act
      const { result } = renderHook(() =>
        useArchiveBaseState('edit', mockArchiveEntry)
      );

      // Assert
      expect(result.current.currentImages).toEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ]);
    });
  });

  describe('handles existing replay URL', () => {
    it('should compute existing replay name from URL', () => {
      // Arrange
      const { result } = renderHook(() =>
        useArchiveBaseState('edit', mockArchiveEntry)
      );

      // Assert
      expect(result.current.existingReplayUrl).toBe('https://example.com/replay.w3g');
      expect(result.current.existingReplayName).toBe('replay.w3g');
    });

    it('should update existing replay URL', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveBaseState('create'));

      // Act
      act(() => {
        result.current.setExistingReplayUrl('https://example.com/new-replay.w3g');
      });

      // Assert
      expect(result.current.existingReplayUrl).toBe('https://example.com/new-replay.w3g');
      expect(result.current.existingReplayName).toBe('new-replay.w3g');
    });

    it('should return empty string for replay name when URL is empty', () => {
      // Act
      const { result } = renderHook(() => useArchiveBaseState('create'));

      // Assert
      expect(result.current.existingReplayUrl).toBe('');
      expect(result.current.existingReplayName).toBe('');
    });
  });

  describe('handles date info', () => {
    it('should handle single date type', () => {
      // Arrange
      const entryWithSingleDate: ArchiveEntry = {
        ...mockArchiveEntry,
        dateInfo: {
          type: 'single',
          singleDate: '2024-01-20',
        },
      };

      // Act
      const { result } = renderHook(() =>
        useArchiveBaseState('edit', entryWithSingleDate)
      );

      // Assert
      expect(result.current.formData.dateType).toBe('single');
      expect(result.current.formData.singleDate).toBe('2024-01-20');
    });

    it('should handle undated type', () => {
      // Arrange
      const entryWithUndated: ArchiveEntry = {
        ...mockArchiveEntry,
        dateInfo: {
          type: 'undated',
        },
      };

      // Act
      const { result } = renderHook(() =>
        useArchiveBaseState('edit', entryWithUndated)
      );

      // Assert
      expect(result.current.formData.dateType).toBe('undated');
    });

    it('should convert interval date type to single', () => {
      // Arrange
      const entryWithInterval: ArchiveEntry = {
        ...mockArchiveEntry,
        dateInfo: {
          type: 'interval',
          startDate: '2024-01-10',
          endDate: '2024-01-20',
        },
      };

      // Act
      const { result } = renderHook(() =>
        useArchiveBaseState('edit', entryWithInterval)
      );

      // Assert
      expect(result.current.formData.dateType).toBe('single');
      expect(result.current.formData.singleDate).toBe('2024-01-10');
    });
  });
});



