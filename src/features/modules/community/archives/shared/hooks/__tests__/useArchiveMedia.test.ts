import { renderHook, waitFor } from '@testing-library/react';
import { useArchiveMedia, uploadSelectedMedia } from '../useArchiveMedia';
import * as archiveService from '@/features/modules/community/archives/services';

// Mock archiveService
jest.mock('@/features/infrastructure/lib/archiveService', () => ({
  uploadImage: jest.fn(async (file: File) => `https://example.com/images/${file.name}`),
  uploadImages: jest.fn(async (files: Array<{ file: File; entryId?: string }>) =>
    files.map((f) => `https://example.com/images/${f.file.name}`)
  ),
  uploadReplay: jest.fn(async (file: File) => `https://example.com/replays/${file.name}`),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn((file: File) => `blob:mock-url-${file.name}`);
global.URL.revokeObjectURL = jest.fn();

describe('useArchiveMedia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handles image preview URLs', () => {
    it('should create preview URLs for single image file', () => {
      // Arrange
      const imageFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      // Act
      const { result } = renderHook(() => useArchiveMedia(imageFile, []));

      // Assert
      expect(result.current.imagePreviewUrls).toHaveLength(1);
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(imageFile);
    });

    it('should create preview URLs for multiple image files', () => {
      // Arrange
      const imageFiles = [
        new File(['content1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];

      // Act
      const { result } = renderHook(() => useArchiveMedia(null, imageFiles));

      // Assert
      expect(result.current.imagePreviewUrls).toHaveLength(2);
      // createObjectURL may be called multiple times due to re-renders
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should prioritize imageFiles over imageFile', () => {
      // Arrange
      const imageFile = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' });
      const imageFiles = [
        new File(['content2'], 'test2.jpg', { type: 'image/jpeg' }),
        new File(['content3'], 'test3.jpg', { type: 'image/jpeg' }),
      ];

      // Act
      const { result } = renderHook(() => useArchiveMedia(imageFile, imageFiles));

      // Assert
      expect(result.current.imagePreviewUrls).toHaveLength(2);
      // createObjectURL may be called multiple times due to re-renders
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should return empty array when no images', () => {
      // Act
      const { result } = renderHook(() => useArchiveMedia(null, []));

      // Assert
      expect(result.current.imagePreviewUrls).toEqual([]);
    });

    it('should revoke object URLs on unmount', () => {
      // Arrange
      const imageFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const { result, unmount } = renderHook(() => useArchiveMedia(imageFile, []));

      // Act
      const urls = result.current.imagePreviewUrls;
      unmount();

      // Assert
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(urls[0]);
    });
  });
});

describe('uploadSelectedMedia', () => {
  describe('handles image uploads', () => {
    it('should upload single image file', async () => {
      // Arrange
      const imageFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      // Act
      const result = await uploadSelectedMedia(
        imageFile,
        [],
        [],
        'create',
        null
      );

      // Assert
      expect(result.images).toEqual(['https://example.com/images/test.jpg']);
      expect(result.replayUrl).toBeUndefined();
    });

    it('should upload multiple image files', async () => {
      // Arrange
      const imageFiles = [
        new File(['content1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];

      // Act
      const result = await uploadSelectedMedia(
        null,
        imageFiles,
        [],
        'create',
        null
      );

      // Assert
      expect(result.images).toEqual([
        'https://example.com/images/test1.jpg',
        'https://example.com/images/test2.jpg',
      ]);
    });

    it('should prioritize imageFiles over imageFile', async () => {
      // Arrange
      const imageFile = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' });
      const imageFiles = [
        new File(['content2'], 'test2.jpg', { type: 'image/jpeg' }),
        new File(['content3'], 'test3.jpg', { type: 'image/jpeg' }),
      ];

      // Act
      const result = await uploadSelectedMedia(
        imageFile,
        imageFiles,
        [],
        'create',
        null
      );

      // Assert
      expect(result.images).toHaveLength(2);
      expect(result.images?.[0]).toContain('test2.jpg');
    });

    it('should use currentImages in edit mode when no new files', async () => {
      // Arrange
      const currentImages = ['https://example.com/existing1.jpg', 'https://example.com/existing2.jpg'];

      // Act
      const result = await uploadSelectedMedia(
        null,
        [],
        currentImages,
        'edit',
        null
      );

      // Assert
      expect(result.images).toEqual(currentImages);
    });

    it('should not upload images in create mode when no files', async () => {
      // Act
      const result = await uploadSelectedMedia(null, [], [], 'create', null);

      // Assert
      expect(result.images).toBeUndefined();
    });
  });

  describe('handles replay files', () => {
    it('should upload replay file', async () => {
      // Arrange
      const replayFile = new File(['content'], 'replay.w3g', {
        type: 'application/octet-stream',
      });

      // Act
      const result = await uploadSelectedMedia(
        null,
        [],
        [],
        'create',
        replayFile
      );

      // Assert
      expect(result.replayUrl).toBe('https://example.com/replays/replay.w3g');
      expect(result.images).toBeUndefined();
    });

    it('should not upload replay when no file provided', async () => {
      // Act
      const result = await uploadSelectedMedia(null, [], [], 'create', null);

      // Assert
      expect(result.replayUrl).toBeUndefined();
    });
  });

  describe('handles entryId parameter', () => {
    it('should pass entryId when uploading images', async () => {
      // Arrange
      const uploadImages = archiveService.uploadImages as jest.MockedFunction<typeof archiveService.uploadImages>;
      const imageFiles = [
        new File(['content1'], 'test1.jpg', { type: 'image/jpeg' }),
      ];

      // Act
      await uploadSelectedMedia(null, imageFiles, [], 'edit', null, 'entry-123');

      // Assert
      expect(uploadImages).toHaveBeenCalledWith([
        { file: imageFiles[0], entryId: 'entry-123' },
      ]);
    });

    it('should pass entryId when uploading replay', async () => {
      // Arrange
      const uploadReplay = archiveService.uploadReplay as jest.MockedFunction<typeof archiveService.uploadReplay>;
      const replayFile = new File(['content'], 'replay.w3g', {
        type: 'application/octet-stream',
      });

      // Act
      await uploadSelectedMedia(null, [], [], 'edit', replayFile, 'entry-123');

      // Assert
      expect(uploadReplay).toHaveBeenCalledWith(replayFile, 'entry-123');
    });
  });

  describe('handles combined uploads', () => {
    it('should upload both images and replay when provided', async () => {
      // Arrange
      const imageFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const replayFile = new File(['content'], 'replay.w3g', {
        type: 'application/octet-stream',
      });

      // Act
      const result = await uploadSelectedMedia(
        imageFile,
        [],
        [],
        'create',
        replayFile
      );

      // Assert
      expect(result.images).toEqual(['https://example.com/images/test.jpg']);
      expect(result.replayUrl).toBe('https://example.com/replays/replay.w3g');
    });
  });
});



