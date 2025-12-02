import { act, renderHook, waitFor } from '@testing-library/react';
import { useArchiveFormSubmit } from '../useArchiveFormSubmit';
import type { ArchiveEntry } from '@/types/archive';
import * as archiveValidation from '../../utils/archiveValidation';
import * as useArchiveMedia from '../useArchiveMedia';
import * as logging from '@/features/infrastructure/logging';

// Mock dependencies
jest.mock('../../utils/archiveValidation', () => ({
  validateArchiveForm: jest.fn(() => null),
}));

jest.mock('../../utils/archiveFormUtils', () => ({
  buildDateInfo: jest.fn((params) => ({
    type: params.dateType,
    ...(params.dateType === 'single' && params.singleDate && { singleDate: params.singleDate }),
    ...(params.dateType === 'undated' && params.approximateText && { approximateText: params.approximateText }),
  })),
  computeEffectiveSectionOrder: jest.fn((order, flags) => order),
}));

jest.mock('../useArchiveMedia', () => ({
  uploadSelectedMedia: jest.fn(async () => ({ images: undefined, replayUrl: undefined })),
}));

jest.mock('@/features/infrastructure/logging', () => ({
  logError: jest.fn(),
}));

describe('useArchiveFormSubmit', () => {
  const mockOnSubmit = jest.fn(async () => {});
  const mockOnSuccess = jest.fn();

  const defaultFormData = {
    title: 'Test Archive',
    content: 'Test content',
    author: 'Test Author',
    dateType: 'single',
    singleDate: '2024-01-15',
    approximateText: '',
    entryType: '',
    mediaUrl: '',
    twitchClipUrl: '',
  };

  const defaultProps = {
    mode: 'create' as const,
    formData: defaultFormData,
    imageFile: null,
    imageFiles: [],
    currentImages: [],
    replayFile: null,
    sectionOrder: ['text', 'images'],
    onSubmit: mockOnSubmit,
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializes state correctly', () => {
    it('should initialize with default values', () => {
      // Act
      const { result } = renderHook(() => useArchiveFormSubmit(defaultProps));

      // Assert
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.error).toBe('');
    });
  });

  describe('handles form submission', () => {
    it('should submit create form successfully', async () => {
      // Arrange
      const { result } = renderHook(() => useArchiveFormSubmit(defaultProps));
      const event = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      await waitFor(() => {
        expect(event.preventDefault).toHaveBeenCalled();
        expect(mockOnSubmit).toHaveBeenCalled();
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.error).toBe('');
      });
    });

    it('should submit edit form successfully', async () => {
      // Arrange
      const mockEntry: ArchiveEntry = {
        id: 'archive1',
        title: 'Existing Archive',
        content: 'Existing content',
        creatorName: 'Existing Author',
        dateInfo: {
          type: 'single',
          singleDate: '2024-01-10',
        },
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z',
      };

      const { result } = renderHook(() =>
        useArchiveFormSubmit({
          ...defaultProps,
          mode: 'edit',
          initialEntry: mockEntry,
        })
      );
      const event = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
      });
    });

    it('should set isSubmitting during submission', async () => {
      // Arrange
      let resolveSubmit: () => void;
      const delayedSubmit = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveSubmit = resolve;
          })
      );

      const { result } = renderHook(() =>
        useArchiveFormSubmit({
          ...defaultProps,
          onSubmit: delayedSubmit,
        })
      );
      const event = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      // Act
      act(() => {
        result.current.handleSubmit(event);
      });

      // Assert - should be submitting
      expect(result.current.isSubmitting).toBe(true);

      // Complete submission
      await act(async () => {
        resolveSubmit!();
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('handles form validation', () => {
    it('should set error when validation fails', async () => {
      // Arrange
      const validateArchiveForm = archiveValidation.validateArchiveForm as jest.MockedFunction<typeof archiveValidation.validateArchiveForm>;
      validateArchiveForm.mockReturnValueOnce('Title is required');

      const { result } = renderHook(() => useArchiveFormSubmit(defaultProps));
      const event = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      expect(result.current.error).toBe('Title is required');
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should use defaultAuthor in create mode', async () => {
      // Arrange
      const validateArchiveForm = archiveValidation.validateArchiveForm as jest.MockedFunction<typeof archiveValidation.validateArchiveForm>;
      const { result } = renderHook(() =>
        useArchiveFormSubmit({
          ...defaultProps,
          defaultAuthor: 'Default Author',
          formData: { ...defaultFormData, author: '' },
        })
      );
      const event = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      expect(validateArchiveForm).toHaveBeenCalledWith(
        expect.objectContaining({
          author: 'Default Author',
        })
      );
    });
  });

  describe('handles media uploads', () => {
    it('should upload images during submission', async () => {
      // Arrange
      const uploadSelectedMedia = useArchiveMedia.uploadSelectedMedia as jest.MockedFunction<typeof useArchiveMedia.uploadSelectedMedia>;
      const imageFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      const { result } = renderHook(() =>
        useArchiveFormSubmit({
          ...defaultProps,
          imageFile,
        })
      );
      const event = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      expect(uploadSelectedMedia).toHaveBeenCalledWith(
        imageFile,
        [],
        [],
        'create',
        null,
        undefined
      );
    });

    it('should upload replay file during submission', async () => {
      // Arrange
      const uploadSelectedMedia = useArchiveMedia.uploadSelectedMedia as jest.MockedFunction<typeof useArchiveMedia.uploadSelectedMedia>;
      const replayFile = new File(['content'], 'replay.w3g', {
        type: 'application/octet-stream',
      });

      const { result } = renderHook(() =>
        useArchiveFormSubmit({
          ...defaultProps,
          replayFile,
        })
      );
      const event = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      expect(uploadSelectedMedia).toHaveBeenCalledWith(
        null,
        [],
        [],
        'create',
        replayFile,
        undefined
      );
    });

    it('should pass entryId in edit mode', async () => {
      // Arrange
      const uploadSelectedMedia = useArchiveMedia.uploadSelectedMedia as jest.MockedFunction<typeof useArchiveMedia.uploadSelectedMedia>;
      const mockEntry: ArchiveEntry = {
        id: 'archive1',
        title: 'Test',
        content: 'Content',
        creatorName: 'Author',
        dateInfo: { type: 'single', singleDate: '2024-01-15' },
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      };

      const { result } = renderHook(() =>
        useArchiveFormSubmit({
          ...defaultProps,
          mode: 'edit',
          initialEntry: mockEntry,
        })
      );
      const event = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      expect(uploadSelectedMedia).toHaveBeenCalledWith(
        null,
        [],
        [],
        'edit',
        null,
        'archive1'
      );
    });
  });

  describe('handles errors', () => {
    it('should handle submission errors', async () => {
      // Arrange
      const { logError } = jest.requireMock('@/features/infrastructure/logging');
      const error = new Error('Submission failed');
      mockOnSubmit.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useArchiveFormSubmit(defaultProps));
      const event = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe('Submission failed');
        expect(logging.logError).toHaveBeenCalled();
        expect(result.current.isSubmitting).toBe(false);
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });

    it('should handle unknown errors', async () => {
      // Arrange
      mockOnSubmit.mockRejectedValueOnce('String error');

      const { result } = renderHook(() => useArchiveFormSubmit(defaultProps));
      const event = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.isSubmitting).toBe(false);
      });
    });
  });

  describe('handles create mode payload', () => {
    it('should include all fields in create payload', async () => {
      // Arrange
      const uploadSelectedMedia = useArchiveMedia.uploadSelectedMedia as jest.MockedFunction<typeof useArchiveMedia.uploadSelectedMedia>;
      uploadSelectedMedia.mockResolvedValueOnce({
        images: ['https://example.com/image.jpg'],
        replayUrl: 'https://example.com/replay.w3g',
      });

      const { result } = renderHook(() =>
        useArchiveFormSubmit({
          ...defaultProps,
          formData: {
            ...defaultFormData,
            entryType: 'story',
            mediaUrl: 'https://youtube.com/watch?v=test',
            twitchClipUrl: 'https://twitch.tv/clip/test',
          },
        })
      );
      const event = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Archive',
          content: 'Test content',
          creatorName: 'Test Author',
          entryType: 'story',
          images: ['https://example.com/image.jpg'],
          videoUrl: 'https://youtube.com/watch?v=test',
          twitchClipUrl: 'https://twitch.tv/clip/test',
          replayUrl: 'https://example.com/replay.w3g',
        })
      );
    });
  });

  describe('handles edit mode payload', () => {
    it('should include updates in edit payload', async () => {
      // Arrange
      const mockEntry: ArchiveEntry = {
        id: 'archive1',
        title: 'Old Title',
        content: 'Old content',
        creatorName: 'Old Author',
        dateInfo: { type: 'single', singleDate: '2024-01-10' },
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z',
      };

      const { result } = renderHook(() =>
        useArchiveFormSubmit({
          ...defaultProps,
          mode: 'edit',
          initialEntry: mockEntry,
        })
      );
      const event = { preventDefault: jest.fn() } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Archive',
          content: 'Test content',
          creatorName: 'Test Author',
          videoUrl: '',
          twitchClipUrl: '',
        })
      );
    });
  });

  describe('handles error state', () => {
    it('should allow setting error manually', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveFormSubmit(defaultProps));

      // Act
      act(() => {
        result.current.setError('Manual error');
      });

      // Assert
      expect(result.current.error).toBe('Manual error');
    });
  });
});



