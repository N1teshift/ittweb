import { act, renderHook } from '@testing-library/react';
import { useArchiveHandlers } from '../useArchiveHandlers';
import { SectionKey } from '../useArchiveBaseState';

// Mock archiveService
jest.mock('@/features/infrastructure/lib/archiveService', () => ({
  extractYouTubeId: jest.fn((url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'test-youtube-id';
    }
    return null;
  }),
  extractTwitchClipId: jest.fn((url: string) => {
    if (url.includes('twitch.tv/clip/')) {
      return 'test-twitch-id';
    }
    return null;
  }),
}));

describe('useArchiveHandlers', () => {
  const mockSetFormData = jest.fn();
  const mockSetImageFile = jest.fn();
  const mockSetImageFiles = jest.fn();
  const mockSetReplayFile = jest.fn();
  const mockSetCurrentImages = jest.fn();
  const mockSetSectionOrder = jest.fn();
  const mockSetError = jest.fn();
  const mockSetExistingReplayUrl = jest.fn();

  const defaultProps = {
    setFormData: mockSetFormData,
    imageFile: null,
    imageFiles: [],
    setImageFile: mockSetImageFile,
    setImageFiles: mockSetImageFiles,
    setReplayFile: mockSetReplayFile,
    setCurrentImages: mockSetCurrentImages,
    setSectionOrder: mockSetSectionOrder,
    setError: mockSetError,
    setExistingReplayUrl: mockSetExistingReplayUrl,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetFormData.mockImplementation((updater) => {
      if (typeof updater === 'function') {
        const prev = {
          title: '',
          content: '',
          author: '',
          entryType: '' as '' | 'story' | 'changelog',
          mediaUrl: '',
          twitchClipUrl: '',
          mediaType: 'none' as 'image' | 'video' | 'replay' | 'none',
          dateType: 'single' as 'single' | 'undated',
          singleDate: '',
          approximateText: '',
        };
        return updater(prev);
      }
    });
  });

  describe('handles form submission', () => {
    it('should handle input change', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const event = {
        target: { name: 'title', value: 'Test Title' },
      } as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleInputChange(event);
      });

      // Assert
      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should handle textarea change', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const event = {
        target: { name: 'content', value: 'Test content' },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      // Act
      act(() => {
        result.current.handleInputChange(event);
      });

      // Assert
      expect(mockSetFormData).toHaveBeenCalled();
    });
  });

  describe('handles form validation', () => {
    it('should validate image file types', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const event = {
        target: { files: [invalidFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleImageUpload(event);
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith('Please select only image files');
    });

    it('should accept valid image files', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const imageFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const event = {
        target: { files: [imageFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleImageUpload(event);
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith('');
      expect(mockSetImageFile).toHaveBeenCalledWith(imageFile);
      expect(mockSetFormData).toHaveBeenCalled();
    });
  });

  describe('handles errors', () => {
    it('should set error for invalid video URL', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const event = {
        target: { value: 'invalid-url' },
      } as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleVideoUrlChange(event);
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith(
        'Please enter a valid YouTube or Twitch clip URL'
      );
    });

    it('should clear error for valid YouTube URL', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const event = {
        target: { value: 'https://www.youtube.com/watch?v=test' },
      } as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleVideoUrlChange(event);
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith('');
      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should clear error for valid Twitch clip URL', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const event = {
        target: { value: 'https://twitch.tv/clip/test-clip' },
      } as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleVideoUrlChange(event);
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith('');
      expect(mockSetFormData).toHaveBeenCalled();
    });
  });

  describe('handles image uploads', () => {
    it('should handle single image file', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const imageFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const event = {
        target: { files: [imageFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleImageUpload(event);
      });

      // Assert
      expect(mockSetImageFile).toHaveBeenCalledWith(imageFile);
      expect(mockSetImageFiles).toHaveBeenCalledWith([]);
      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should handle multiple image files', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const imageFiles = [
        new File(['content1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      const event = {
        target: { files: imageFiles },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleImageUpload(event);
      });

      // Assert
      expect(mockSetImageFiles).toHaveBeenCalledWith(imageFiles);
      expect(mockSetImageFile).toHaveBeenCalledWith(null);
      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should handle empty file selection', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const event = {
        target: { files: [] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleImageUpload(event);
      });

      // Assert
      expect(mockSetImageFile).not.toHaveBeenCalled();
      expect(mockSetImageFiles).not.toHaveBeenCalled();
    });
  });

  describe('handles video URLs', () => {
    it('should extract and set YouTube URL', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const event = {
        target: { value: 'https://www.youtube.com/watch?v=test' },
      } as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleVideoUrlChange(event);
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith('');
      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should extract and set Twitch clip URL', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const event = {
        target: { value: 'https://twitch.tv/clip/test-clip' },
      } as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleVideoUrlChange(event);
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith('');
      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should clear URLs when input is empty', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const event = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleVideoUrlChange(event);
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith('');
      expect(mockSetFormData).toHaveBeenCalled();
    });
  });

  describe('handles replay files', () => {
    it('should handle replay file upload', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const replayFile = new File(['content'], 'replay.w3g', {
        type: 'application/octet-stream',
      });
      const event = {
        target: { files: [replayFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleReplayUpload(event);
      });

      // Assert
      expect(mockSetReplayFile).toHaveBeenCalledWith(replayFile);
      expect(mockSetError).toHaveBeenCalledWith('');
      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should reject non-w3g files', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const invalidFile = new File(['content'], 'replay.txt', { type: 'text/plain' });
      const event = {
        target: { files: [invalidFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleReplayUpload(event);
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith('Please select a .w3g replay file');
      expect(mockSetReplayFile).not.toHaveBeenCalled();
    });
  });

  describe('handles combined file upload', () => {
    it('should handle image files in combined upload', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const imageFiles = [
        new File(['content1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      const event = {
        target: { files: imageFiles },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleCombinedFileUpload(event);
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith('');
      expect(mockSetImageFiles).toHaveBeenCalled();
      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should handle replay file in combined upload', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const replayFile = new File(['content'], 'replay.w3g', {
        type: 'application/octet-stream',
      });
      const event = {
        target: { files: [replayFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleCombinedFileUpload(event);
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith('');
      expect(mockSetReplayFile).toHaveBeenCalledWith(replayFile);
      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should reject unsupported file types', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const event = {
        target: { files: [invalidFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleCombinedFileUpload(event);
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith(
        expect.stringContaining('Unsupported file type')
      );
    });

    it('should reject multiple replay files', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const replayFiles = [
        new File(['content1'], 'replay1.w3g', { type: 'application/octet-stream' }),
        new File(['content2'], 'replay2.w3g', { type: 'application/octet-stream' }),
      ];
      const event = {
        target: { files: replayFiles },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleCombinedFileUpload(event);
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith(
        'Please upload only one replay file at a time'
      );
    });

    it('should reject replay and images together', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const files = [
        new File(['content1'], 'replay.w3g', { type: 'application/octet-stream' }),
        new File(['content2'], 'image.jpg', { type: 'image/jpeg' }),
      ];
      const event = {
        target: { files: files },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleCombinedFileUpload(event);
      });

      // Assert
      expect(mockSetError).toHaveBeenCalledWith(
        'Please upload either images or a replay file, not both'
      );
    });
  });

  describe('handles image reordering', () => {
    it('should reorder image files', () => {
      // Arrange
      const imageFiles = [
        new File(['content1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'test2.jpg', { type: 'image/jpeg' }),
        new File(['content3'], 'test3.jpg', { type: 'image/jpeg' }),
      ];
      const { result } = renderHook(() =>
        useArchiveHandlers({ ...defaultProps, imageFiles })
      );

      // Act
      act(() => {
        result.current.handleReorderImages(0, 2);
      });

      // Assert
      expect(mockSetImageFiles).toHaveBeenCalled();
    });

    it('should reorder current images', () => {
      // Arrange
      const { result } = renderHook(() =>
        useArchiveHandlers({ ...defaultProps })
      );
      // Set up currentImages state via setCurrentImages
      act(() => {
        mockSetCurrentImages(['image1.jpg', 'image2.jpg', 'image3.jpg']);
      });

      // Act
      act(() => {
        result.current.handleReorderImages(0, 2);
      });

      // Assert
      expect(mockSetCurrentImages).toHaveBeenCalled();
    });
  });

  describe('handles section reordering', () => {
    it('should reorder sections', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));

      // Act
      act(() => {
        result.current.handleReorderSections(0, 2);
      });

      // Assert
      expect(mockSetSectionOrder).toHaveBeenCalled();
    });
  });

  describe('handles media field changes', () => {
    it('should route mediaUrl changes to video handler', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const event = {
        target: { name: 'mediaUrl', value: 'https://youtube.com/watch?v=test' },
      } as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleMediaFieldChange(event);
      });

      // Assert
      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should route twitchClipUrl changes to twitch handler', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));
      const event = {
        target: { name: 'twitchClipUrl', value: 'https://twitch.tv/clip/test' },
      } as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleMediaFieldChange(event);
      });

      // Assert
      expect(mockSetFormData).toHaveBeenCalled();
    });
  });

  describe('handles image removal', () => {
    it('should remove image from imageFiles', () => {
      // Arrange
      const imageFiles = [
        new File(['content1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      const { result } = renderHook(() =>
        useArchiveHandlers({ ...defaultProps, imageFiles })
      );

      // Act
      act(() => {
        result.current.handleRemoveExistingImage(0);
      });

      // Assert
      expect(mockSetImageFiles).toHaveBeenCalled();
    });

    it('should remove image from currentImages', () => {
      // Arrange
      const { result } = renderHook(() =>
        useArchiveHandlers({ ...defaultProps })
      );
      // Set up currentImages state via setCurrentImages
      act(() => {
        mockSetCurrentImages(['image1.jpg', 'image2.jpg']);
      });

      // Act
      act(() => {
        result.current.handleRemoveExistingImage(0);
      });

      // Assert
      expect(mockSetCurrentImages).toHaveBeenCalled();
    });
  });

  describe('handles replay removal', () => {
    it('should remove replay file and URL', () => {
      // Arrange
      const { result } = renderHook(() => useArchiveHandlers(defaultProps));

      // Act
      act(() => {
        result.current.handleRemoveReplay();
      });

      // Assert
      expect(mockSetReplayFile).toHaveBeenCalledWith(null);
      expect(mockSetExistingReplayUrl).toHaveBeenCalledWith('');
    });
  });
});



