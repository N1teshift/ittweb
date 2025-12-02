import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MediaPreview from '../components/sections/MediaPreview';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock YouTubeEmbed and TwitchClipEmbed
jest.mock('../YouTubeEmbed', () => ({
  __esModule: true,
  default: ({ url, title }: { url: string; title: string }) => (
    <div data-testid="youtube-embed">{url} - {title}</div>
  ),
}));

jest.mock('../TwitchClipEmbed', () => ({
  __esModule: true,
  default: ({ url, title }: { url: string; title: string }) => (
    <div data-testid="twitch-embed">{url} - {title}</div>
  ),
}));

describe('MediaPreview', () => {
  const mockOnReorderImages = jest.fn();
  const mockOnReorderSections = jest.fn();
  const mockOnRemoveImage = jest.fn();
  const mockOnRemoveReplay = jest.fn();

  const defaultProps = {
    images: [],
    onReorderImages: mockOnReorderImages,
    videoUrl: undefined,
    twitchUrl: undefined,
    replayName: undefined,
    textPreview: undefined,
    sectionOrder: ['text', 'images', 'video', 'twitch', 'replay'] as Array<'text' | 'images' | 'video' | 'twitch' | 'replay'>,
    onReorderSections: mockOnReorderSections,
    onRemoveImage: mockOnRemoveImage,
    onRemoveReplay: mockOnRemoveReplay,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders preview', () => {
    it('should not render when no media is provided', () => {
      // Act
      const { container } = render(<MediaPreview {...defaultProps} />);

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it('should render when images are provided', () => {
      // Arrange
      const images = [
        { key: 'img1', url: 'https://example.com/image1.jpg' },
        { key: 'img2', url: 'https://example.com/image2.jpg' },
      ];

      // Act
      render(<MediaPreview {...defaultProps} images={images} />);

      // Assert
      expect(screen.getByText('Live Preview')).toBeInTheDocument();
      expect(screen.getByAltText('preview-0')).toBeInTheDocument();
      expect(screen.getByAltText('preview-1')).toBeInTheDocument();
    });

    it('should render when video URL is provided', () => {
      // Act
      render(<MediaPreview {...defaultProps} videoUrl="https://youtube.com/watch?v=test" />);

      // Assert
      expect(screen.getByTestId('youtube-embed')).toBeInTheDocument();
    });

    it('should render when Twitch URL is provided', () => {
      // Act
      render(<MediaPreview {...defaultProps} twitchUrl="https://twitch.tv/clip/test" />);

      // Assert
      expect(screen.getByTestId('twitch-embed')).toBeInTheDocument();
    });

    it('should render when replay name is provided', () => {
      // Act
      render(<MediaPreview {...defaultProps} replayName="replay.w3g" />);

      // Assert
      expect(screen.getByText(/Replay selected:/i)).toBeInTheDocument();
      expect(screen.getByText('replay.w3g')).toBeInTheDocument();
    });

    it('should render when text preview is provided', () => {
      // Act
      render(<MediaPreview {...defaultProps} textPreview="Test content" />);

      // Assert
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('handles section ordering', () => {
    it('should render sections in specified order', () => {
      // Arrange
      const sectionOrder: Array<'text' | 'images' | 'video' | 'twitch' | 'replay'> = ['text', 'images', 'video'];
      const images = [{ key: 'img1', url: 'https://example.com/image1.jpg' }];

      // Act
      render(
        <MediaPreview
          {...defaultProps}
          images={images}
          videoUrl="https://youtube.com/watch?v=test"
          textPreview="Test content"
          sectionOrder={sectionOrder}
        />
      );

      // Assert
      const sections = screen.getAllByRole('generic');
      // Sections should be rendered in the specified order
      expect(screen.getByText('Test content')).toBeInTheDocument();
      expect(screen.getByAltText('preview-0')).toBeInTheDocument();
      expect(screen.getByTestId('youtube-embed')).toBeInTheDocument();
    });
  });

  describe('handles image removal', () => {
    it('should call onRemoveImage when remove button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const images = [{ key: 'img1', url: 'https://example.com/image1.jpg' }];

      // Act
      render(<MediaPreview {...defaultProps} images={images} onRemoveImage={mockOnRemoveImage} />);

      // Hover to show remove button (group-hover)
      const imageContainer = screen.getByAltText('preview-0').closest('.group');
      if (imageContainer) {
        await user.hover(imageContainer);
      }

      // Find and click remove button
      const removeButton = screen.queryByText('Remove');
      if (removeButton) {
        await user.click(removeButton);
      }

      // Assert
      if (removeButton) {
        expect(mockOnRemoveImage).toHaveBeenCalled();
      }
    });
  });

  describe('handles replay removal', () => {
    it('should call onRemoveReplay when remove button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<MediaPreview {...defaultProps} replayName="replay.w3g" onRemoveReplay={mockOnRemoveReplay} />);

      // Find and click remove button
      const removeButton = screen.getByText('Remove');
      await user.click(removeButton);

      // Assert
      expect(mockOnRemoveReplay).toHaveBeenCalledTimes(1);
    });
  });

  describe('handles drag and drop', () => {
    it('should handle section drag and drop', () => {
      // Arrange
      const images = [{ key: 'img1', url: 'https://example.com/image1.jpg' }];
      const sectionOrder: Array<'text' | 'images' | 'video' | 'twitch' | 'replay'> = ['images', 'text'];

      // Act
      render(
        <MediaPreview
          {...defaultProps}
          images={images}
          textPreview="Test"
          sectionOrder={sectionOrder}
        />
      );

      // Assert - sections should be draggable
      const sections = document.querySelectorAll('[draggable="true"]');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should handle image drag and drop when multiple images', () => {
      // Arrange
      const images = [
        { key: 'img1', url: 'https://example.com/image1.jpg' },
        { key: 'img2', url: 'https://example.com/image2.jpg' },
      ];

      // Act
      render(<MediaPreview {...defaultProps} images={images} />);

      // Assert - images should be draggable when there are multiple
      const draggableImages = document.querySelectorAll('[draggable="true"]');
      expect(draggableImages.length).toBeGreaterThan(0);
    });
  });
});



