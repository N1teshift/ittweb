import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArchiveFormBase from '../components/ArchiveFormBase';
import type { ArchiveEntry } from '@/types/archive';

// Mock all hooks
const mockFormData = {
  title: '',
  content: '',
  dateType: 'single' as const,
  singleDate: '',
  approximateText: '',
  entryType: '',
  mediaUrl: '',
  twitchClipUrl: '',
};

const mockSetFormData = jest.fn();
const mockSetImageFile = jest.fn();
const mockSetImageFiles = jest.fn();
const mockSetReplayFile = jest.fn();
const mockSetCurrentImages = jest.fn();
const mockSetSectionOrder = jest.fn();
const mockSetExistingReplayUrl = jest.fn();

const mockUseArchiveBaseStateDefaultReturn = () => ({
  formData: mockFormData,
  setFormData: mockSetFormData,
  imageFile: null,
  setImageFile: mockSetImageFile,
  imageFiles: [] as File[],
  setImageFiles: mockSetImageFiles,
  replayFile: null,
  setReplayFile: mockSetReplayFile,
  currentImages: [],
  setCurrentImages: mockSetCurrentImages,
  sectionOrder: ['text', 'images', 'video', 'twitch', 'replay'],
  setSectionOrder: mockSetSectionOrder,
  existingReplayUrl: undefined,
  existingReplayName: undefined,
  setExistingReplayUrl: mockSetExistingReplayUrl,
});

const mockUseArchiveBaseState = jest.fn(mockUseArchiveBaseStateDefaultReturn);

jest.mock('../../hooks/useArchiveBaseState', () => ({
  useArchiveBaseState: jest.fn((...args: any[]) => {
    return mockUseArchiveBaseState.apply(null, args as any);
  }),
}));

jest.mock('../../hooks/useArchiveMedia', () => ({
  useArchiveMedia: jest.fn(() => ({
    imagePreviewUrls: [],
  })),
}));

const mockHandleSubmit = jest.fn();
const mockSetError = jest.fn();

jest.mock('../../hooks/useArchiveFormSubmit', () => ({
  useArchiveFormSubmit: jest.fn(() => ({
    handleSubmit: mockHandleSubmit,
    isSubmitting: false,
    error: '',
    setError: mockSetError,
  })),
}));

const mockHandleInputChange = jest.fn();
const mockHandleReorderImages = jest.fn();
const mockHandleReorderSections = jest.fn();
const mockHandleVideoUrlChange = jest.fn();
const mockHandleCombinedFileUpload = jest.fn();
const mockHandleRemoveExistingImage = jest.fn();
const mockHandleRemoveReplay = jest.fn();

jest.mock('../../hooks/useArchiveHandlers', () => ({
  useArchiveHandlers: jest.fn(() => ({
    handleInputChange: mockHandleInputChange,
    handleReorderImages: mockHandleReorderImages,
    handleReorderSections: mockHandleReorderSections,
    handleVideoUrlChange: mockHandleVideoUrlChange,
    handleCombinedFileUpload: mockHandleCombinedFileUpload,
    handleRemoveExistingImage: mockHandleRemoveExistingImage,
    handleRemoveReplay: mockHandleRemoveReplay,
  })),
}));

// Mock child components
jest.mock('../components/sections/FormHeader', () => ({
  __esModule: true,
  default: ({ mode }: { mode: 'create' | 'edit' }) => (
    <div data-testid="form-header">Mode: {mode}</div>
  ),
}));

jest.mock('../components/sections/DateSelector', () => ({
  __esModule: true,
  default: ({ dateType, singleDate, approximateText, onFieldChange }: any) => (
    <div data-testid="date-selector">
      <div>Date Type: {dateType}</div>
      <div>Single Date: {singleDate}</div>
      <div>Approximate: {approximateText}</div>
      <button onClick={() => onFieldChange({ target: { name: 'dateType', value: 'undated' } })}>
        Change Date Type
      </button>
    </div>
  ),
}));

jest.mock('../components/sections/MediaSelector', () => ({
  __esModule: true,
  default: ({ videoUrl, onVideoUrlChange, onFileUpload, videoError }: any) => (
    <div data-testid="media-selector">
      <input
        type="url"
        value={videoUrl}
        onChange={(e) => onVideoUrlChange(e)}
        placeholder="Video URL"
        data-testid="video-url-input"
      />
      <input
        type="file"
        onChange={(e) => onFileUpload(e)}
        data-testid="file-upload-input"
      />
      {videoError && <div data-testid="video-error">{videoError}</div>}
    </div>
  ),
}));

jest.mock('../components/sections/MediaPreview', () => ({
  __esModule: true,
  default: ({
    images,
    onReorderImages,
    videoUrl,
    twitchUrl,
    replayName,
    textPreview,
    onRemoveImage,
    onRemoveReplay,
  }: any) => (
    <div data-testid="media-preview">
      {images.length > 0 && <div data-testid="preview-images">Images: {images.length}</div>}
      {videoUrl && <div data-testid="preview-video">Video: {videoUrl}</div>}
      {twitchUrl && <div data-testid="preview-twitch">Twitch: {twitchUrl}</div>}
      {replayName && <div data-testid="preview-replay">Replay: {replayName}</div>}
      {textPreview && <div data-testid="preview-text">{textPreview}</div>}
      {onRemoveImage && <button onClick={() => onRemoveImage(0)}>Remove Image</button>}
      {onRemoveReplay && <button onClick={onRemoveReplay}>Remove Replay</button>}
    </div>
  ),
}));

describe('ArchiveFormBase', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset form data
    Object.assign(mockFormData, {
      title: '',
      content: '',
      dateType: 'single' as const,
      singleDate: '',
      approximateText: '',
      entryType: '',
      mediaUrl: '',
      twitchClipUrl: '',
    });
    // Reset useArchiveBaseState mock to default
    mockUseArchiveBaseState.mockImplementation(mockUseArchiveBaseStateDefaultReturn);
  });

  describe('renders form', () => {
    it('should render form with create mode', () => {
      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
      expect(screen.getByText('Mode: create')).toBeInTheDocument();
      expect(screen.getByLabelText(/Title \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Entry Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Text/i)).toBeInTheDocument();
    });

    it('should render form with edit mode', () => {
      // Arrange
      const mockEntry: ArchiveEntry = {
        id: 'entry1',
        title: 'Existing Entry',
        content: 'Existing content',
        creatorName: 'Test Creator',
        dateInfo: {
          type: 'single',
          singleDate: '2024-01-15',
        },
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      };

      // Act
      render(
        <ArchiveFormBase
          mode="edit"
          initialEntry={mockEntry}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      expect(screen.getByText('Mode: edit')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      expect(screen.getByLabelText(/Title \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Entry Type/i)).toBeInTheDocument();
      expect(screen.getByTestId('date-selector')).toBeInTheDocument();
      expect(screen.getByLabelText(/Text/i)).toBeInTheDocument();
      expect(screen.getByTestId('media-selector')).toBeInTheDocument();
      expect(screen.getByTestId('media-preview')).toBeInTheDocument();
    });

    it('should render submit button with create text', () => {
      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      expect(screen.getByText('Add to Archives')).toBeInTheDocument();
    });

    it('should render submit button with edit text', () => {
      // Arrange
      const mockEntry: ArchiveEntry = {
        id: 'entry1',
        title: 'Existing Entry',
        content: 'Existing content',
        creatorName: 'Test Creator',
        dateInfo: {
          type: 'single',
          singleDate: '2024-01-15',
        },
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      };

      // Act
      render(
        <ArchiveFormBase
          mode="edit"
          initialEntry={mockEntry}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      expect(screen.getByText('Update Entry')).toBeInTheDocument();
    });
  });

  describe('handles form input', () => {
    it('should call handleInputChange when title changes', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      const titleInput = screen.getByLabelText(/Title \*/i);
      await user.type(titleInput, 'New Title');

      // Assert
      expect(mockHandleInputChange).toHaveBeenCalled();
    });

    it('should call handleInputChange when content changes', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      const contentInput = screen.getByLabelText(/Text/i);
      await user.type(contentInput, 'New content');

      // Assert
      expect(mockHandleInputChange).toHaveBeenCalled();
    });

    it('should call handleInputChange when entry type changes', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      const entryTypeSelect = screen.getByLabelText(/Entry Type/i);
      await user.selectOptions(entryTypeSelect, 'story');

      // Assert
      expect(mockHandleInputChange).toHaveBeenCalled();
    });
  });

  describe('handles form submission', () => {
    it('should call handleSubmit when form is submitted', async () => {
      // Arrange
      const user = userEvent.setup();
      mockHandleSubmit.mockImplementation((e: React.FormEvent) => {
        e.preventDefault();
      });

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      const submitButton = screen.getByText('Add to Archives');
      await user.click(submitButton);

      // Assert
      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    it('should disable submit button when submitting', () => {
      // Arrange
      const useArchiveFormSubmit = require('../../hooks/useArchiveFormSubmit').useArchiveFormSubmit;
      useArchiveFormSubmit.mockReturnValueOnce({
        handleSubmit: mockHandleSubmit,
        isSubmitting: true,
        error: '',
        setError: mockSetError,
      });

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      const submitButton = screen.getByText('Adding...');
      expect(submitButton).toBeDisabled();
    });

    it('should show updating text when submitting in edit mode', () => {
      // Arrange
      const mockEntry: ArchiveEntry = {
        id: 'entry1',
        title: 'Existing Entry',
        content: 'Existing content',
        creatorName: 'Test Creator',
        dateInfo: {
          type: 'single',
          singleDate: '2024-01-15',
        },
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      };

      const useArchiveFormSubmit = require('../hooks/useArchiveFormSubmit').useArchiveFormSubmit;
      useArchiveFormSubmit.mockReturnValueOnce({
        handleSubmit: mockHandleSubmit,
        isSubmitting: true,
        error: '',
        setError: mockSetError,
      });

      // Act
      render(
        <ArchiveFormBase
          mode="edit"
          initialEntry={mockEntry}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });
  });

  describe('handles cancel action', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('handles media', () => {
    it('should pass video URL to MediaSelector', () => {
      // Arrange
      Object.assign(mockFormData, { mediaUrl: 'https://youtube.com/watch?v=test' });

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      const videoInput = screen.getByTestId('video-url-input');
      expect(videoInput).toHaveValue('https://youtube.com/watch?v=test');
    });

    it('should pass Twitch URL to MediaSelector when mediaUrl is not set', () => {
      // Arrange
      Object.assign(mockFormData, { twitchClipUrl: 'https://twitch.tv/clip/test' });

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      const videoInput = screen.getByTestId('video-url-input');
      expect(videoInput).toHaveValue('https://twitch.tv/clip/test');
    });

    it('should call handleVideoUrlChange when video URL changes', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      const videoInput = screen.getByTestId('video-url-input');
      await user.type(videoInput, 'https://youtube.com/watch?v=test');

      // Assert
      expect(mockHandleVideoUrlChange).toHaveBeenCalled();
    });

    it('should call handleCombinedFileUpload when file is selected', async () => {
      // Arrange
      const user = userEvent.setup();
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      const fileInput = screen.getByTestId('file-upload-input');
      await user.upload(fileInput, file);

      // Assert
      expect(mockHandleCombinedFileUpload).toHaveBeenCalled();
    });

    it('should show video error when error exists and video URL is set', () => {
      // Arrange
      Object.assign(mockFormData, { mediaUrl: 'https://youtube.com/watch?v=test' });
      const useArchiveFormSubmit = require('../hooks/useArchiveFormSubmit').useArchiveFormSubmit;
      useArchiveFormSubmit.mockReturnValueOnce({
        handleSubmit: mockHandleSubmit,
        isSubmitting: false,
        error: 'Invalid video URL',
        setError: mockSetError,
      });

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      expect(screen.getByTestId('video-error')).toBeInTheDocument();
      expect(screen.getByText('Invalid video URL')).toBeInTheDocument();
    });
  });

  describe('handles media preview', () => {
    it('should pass images to MediaPreview', () => {
      // Arrange
      const useArchiveMedia = require('../../hooks/useArchiveMedia').useArchiveMedia;
      useArchiveMedia.mockReturnValueOnce({
        imagePreviewUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      });
      // Mock useArchiveBaseState to return imageFiles so component uses imagePreviewUrls
      mockUseArchiveBaseState.mockReturnValueOnce({
        formData: mockFormData,
        setFormData: mockSetFormData,
        imageFile: null,
        setImageFile: mockSetImageFile,
        imageFiles: [new File([''], 'test.jpg'), new File([''], 'test2.jpg')] as File[], // Set imageFiles
        setImageFiles: mockSetImageFiles,
        replayFile: null,
        setReplayFile: mockSetReplayFile,
        currentImages: [],
        setCurrentImages: mockSetCurrentImages,
        sectionOrder: ['text', 'images', 'video', 'twitch', 'replay'],
        setSectionOrder: mockSetSectionOrder,
        existingReplayUrl: undefined,
        existingReplayName: undefined,
        setExistingReplayUrl: mockSetExistingReplayUrl,
      });

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      expect(screen.getByTestId('preview-images')).toBeInTheDocument();
      expect(screen.getByText(/Images: 2/i)).toBeInTheDocument();
    });

    it('should pass video URL to MediaPreview', () => {
      // Arrange
      Object.assign(mockFormData, { mediaUrl: 'https://youtube.com/watch?v=test' });

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      expect(screen.getByTestId('preview-video')).toBeInTheDocument();
    });

    it('should pass Twitch URL to MediaPreview', () => {
      // Arrange
      Object.assign(mockFormData, { twitchClipUrl: 'https://twitch.tv/clip/test' });

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      expect(screen.getByTestId('preview-twitch')).toBeInTheDocument();
    });

    it('should pass content as text preview to MediaPreview', () => {
      // Arrange
      const testFormData = { ...mockFormData, content: 'Test content preview' };
      mockUseArchiveBaseState.mockReturnValueOnce({
        formData: testFormData,
        setFormData: mockSetFormData,
        imageFile: null,
        setImageFile: mockSetImageFile,
        imageFiles: [],
        setImageFiles: mockSetImageFiles,
        replayFile: null,
        setReplayFile: mockSetReplayFile,
        currentImages: [],
        setCurrentImages: mockSetCurrentImages,
        sectionOrder: ['text', 'images', 'video', 'twitch', 'replay'],
        setSectionOrder: mockSetSectionOrder,
        existingReplayUrl: undefined,
        existingReplayName: undefined,
        setExistingReplayUrl: mockSetExistingReplayUrl,
      });

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      const previewElement = screen.getByTestId('preview-text');
      expect(previewElement).toBeInTheDocument();
      // Verify the content is displayed within the preview element
      expect(previewElement).toHaveTextContent('Test content preview');
    });

    it('should show remove image button in edit mode', () => {
      // Arrange
      const mockEntry: ArchiveEntry = {
        id: 'entry1',
        title: 'Existing Entry',
        content: 'Existing content',
        creatorName: 'Test Creator',
        dateInfo: {
          type: 'single',
          singleDate: '2024-01-15',
        },
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      };
      const useArchiveMedia = require('../../hooks/useArchiveMedia').useArchiveMedia;
      useArchiveMedia.mockReturnValueOnce({
        imagePreviewUrls: ['https://example.com/image1.jpg'],
      });

      // Act
      render(
        <ArchiveFormBase
          mode="edit"
          initialEntry={mockEntry}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      expect(screen.getByText('Remove Image')).toBeInTheDocument();
    });

    it('should not show remove image button in create mode', () => {
      // Arrange
      const useArchiveMedia = require('../../hooks/useArchiveMedia').useArchiveMedia;
      useArchiveMedia.mockReturnValueOnce({
        imagePreviewUrls: ['https://example.com/image1.jpg'],
      });

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      expect(screen.queryByText('Remove Image')).not.toBeInTheDocument();
    });
  });

  describe('handles error display', () => {
    it('should display error message when error exists', () => {
      // Arrange
      const useArchiveFormSubmit = require('../../hooks/useArchiveFormSubmit').useArchiveFormSubmit;
      useArchiveFormSubmit.mockReturnValueOnce({
        handleSubmit: mockHandleSubmit,
        isSubmitting: false,
        error: 'Submission failed',
        setError: mockSetError,
      });

      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      expect(screen.getByText('Submission failed')).toBeInTheDocument();
    });

    it('should not display error when error is empty', () => {
      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
        />
      );

      // Assert
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  describe('handles default author', () => {
    it('should pass defaultAuthor to useArchiveFormSubmit', () => {
      // Act
      render(
        <ArchiveFormBase
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onSuccess={mockOnSuccess}
          defaultAuthor="Test Author"
        />
      );

      // Assert
      const useArchiveFormSubmit = require('../../hooks/useArchiveFormSubmit').useArchiveFormSubmit;
      expect(useArchiveFormSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultAuthor: 'Test Author',
        })
      );
    });
  });
});



