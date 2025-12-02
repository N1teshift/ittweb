import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArchiveMediaSections } from '../components/ArchiveMediaSections';
import type { ArchiveEntry } from '@/types/archive';

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

describe('ArchiveMediaSections', () => {
  const mockOnImageClick = jest.fn();
  const mockOnTextExpand = jest.fn();

  const baseEntry: ArchiveEntry = {
    id: 'entry1',
    title: 'Test Entry',
    content: '',
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
  });

  describe('renders media sections', () => {
    it('should render images when provided', () => {
      // Arrange
      const entryWithImages = {
        ...baseEntry,
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      };

      // Act
      render(<ArchiveMediaSections entry={entryWithImages} onImageClick={mockOnImageClick} />);

      // Assert
      const images = screen.getAllByAltText('Test Entry');
      expect(images.length).toBe(2);
    });

    it('should render YouTube video when videoUrl is provided', () => {
      // Arrange
      const entryWithVideo = {
        ...baseEntry,
        videoUrl: 'https://youtube.com/watch?v=test',
      };

      // Act
      render(<ArchiveMediaSections entry={entryWithVideo} onImageClick={mockOnImageClick} />);

      // Assert
      expect(screen.getByTestId('youtube-embed')).toBeInTheDocument();
    });

    it('should render Twitch clip when twitchClipUrl is provided', () => {
      // Arrange
      const entryWithTwitch = {
        ...baseEntry,
        twitchClipUrl: 'https://twitch.tv/clip/test',
      };

      // Act
      render(<ArchiveMediaSections entry={entryWithTwitch} onImageClick={mockOnImageClick} />);

      // Assert
      expect(screen.getByTestId('twitch-embed')).toBeInTheDocument();
    });

    it('should render replay download link when replayUrl is provided', () => {
      // Arrange
      const entryWithReplay = {
        ...baseEntry,
        replayUrl: 'https://example.com/replay.w3g',
      };

      // Act
      render(<ArchiveMediaSections entry={entryWithReplay} onImageClick={mockOnImageClick} />);

      // Assert
      const replayLink = screen.getByText(/Download replay/i);
      expect(replayLink).toBeInTheDocument();
      expect(replayLink.closest('a')).toHaveAttribute('href', 'https://example.com/replay.w3g');
    });

    it('should render text content when provided', () => {
      // Arrange
      const entryWithContent = {
        ...baseEntry,
        content: 'Test content here',
      };

      // Act
      render(<ArchiveMediaSections entry={entryWithContent} onImageClick={mockOnImageClick} />);

      // Assert
      expect(screen.getByText('Test content here')).toBeInTheDocument();
    });

    it('should not render text when showText is false', () => {
      // Arrange
      const entryWithContent = {
        ...baseEntry,
        content: 'Test content here',
      };

      // Act
      render(<ArchiveMediaSections entry={entryWithContent} showText={false} onImageClick={mockOnImageClick} />);

      // Assert
      expect(screen.queryByText('Test content here')).not.toBeInTheDocument();
    });

    it('should use displayText when provided', () => {
      // Arrange
      const entryWithContent = {
        ...baseEntry,
        content: 'Original content',
      };

      // Act
      render(
        <ArchiveMediaSections
          entry={entryWithContent}
          displayText="Display text"
          onImageClick={mockOnImageClick}
        />
      );

      // Assert
      expect(screen.getByText('Display text')).toBeInTheDocument();
      expect(screen.queryByText('Original content')).not.toBeInTheDocument();
    });
  });

  describe('handles section ordering', () => {
    it('should render sections in specified order', () => {
      // Arrange
      const entryWithAllMedia = {
        ...baseEntry,
        images: ['https://example.com/image1.jpg'],
        videoUrl: 'https://youtube.com/watch?v=test',
        content: 'Test content',
        sectionOrder: ['text', 'images', 'video'] as any,
      };

      // Act
      render(<ArchiveMediaSections entry={entryWithAllMedia} onImageClick={mockOnImageClick} />);

      // Assert
      const sections = screen.getAllByRole('generic');
      expect(sections.length).toBeGreaterThan(0);
      expect(screen.getByText('Test content')).toBeInTheDocument();
      expect(screen.getByAltText('Test Entry')).toBeInTheDocument();
      expect(screen.getByTestId('youtube-embed')).toBeInTheDocument();
    });
  });

  describe('handles image clicks', () => {
    it('should call onImageClick when image is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const entryWithImages = {
        ...baseEntry,
        images: ['https://example.com/image1.jpg'],
      };

      // Act
      render(<ArchiveMediaSections entry={entryWithImages} onImageClick={mockOnImageClick} />);

      const image = screen.getByAltText('Test Entry');
      await user.click(image);

      // Assert
      expect(mockOnImageClick).toHaveBeenCalledWith('https://example.com/image1.jpg', 'Test Entry');
    });

    it('should not call onImageClick when not provided', async () => {
      // Arrange
      const user = userEvent.setup();
      const entryWithImages = {
        ...baseEntry,
        images: ['https://example.com/image1.jpg'],
      };

      // Act
      render(<ArchiveMediaSections entry={entryWithImages} />);

      const image = screen.getByAltText('Test Entry');
      await user.click(image);

      // Assert
      expect(mockOnImageClick).not.toHaveBeenCalled();
    });
  });

  describe('handles text expansion', () => {
    it('should show expand button when shouldTruncate is true', () => {
      // Arrange
      const entryWithContent = {
        ...baseEntry,
        content: 'Long content that should be truncated',
      };

      // Act
      render(
        <ArchiveMediaSections
          entry={entryWithContent}
          shouldTruncate={true}
          onTextExpand={mockOnTextExpand}
          onImageClick={mockOnImageClick}
        />
      );

      // Assert
      expect(screen.getByText('Show More')).toBeInTheDocument();
    });

    it('should show collapse button when expanded', () => {
      // Arrange
      const entryWithContent = {
        ...baseEntry,
        content: 'Long content that should be truncated',
      };

      // Act
      render(
        <ArchiveMediaSections
          entry={entryWithContent}
          shouldTruncate={true}
          isExpanded={true}
          onTextExpand={mockOnTextExpand}
          onImageClick={mockOnImageClick}
        />
      );

      // Assert
      expect(screen.getByText('Show Less')).toBeInTheDocument();
    });

    it('should call onTextExpand when expand button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const entryWithContent = {
        ...baseEntry,
        content: 'Long content',
      };

      // Act
      render(
        <ArchiveMediaSections
          entry={entryWithContent}
          shouldTruncate={true}
          onTextExpand={mockOnTextExpand}
          onImageClick={mockOnImageClick}
        />
      );

      const expandButton = screen.getByText('Show More');
      await user.click(expandButton);

      // Assert
      expect(mockOnTextExpand).toHaveBeenCalledTimes(1);
    });

    it('should not show expand button when shouldTruncate is false', () => {
      // Arrange
      const entryWithContent = {
        ...baseEntry,
        content: 'Content',
      };

      // Act
      render(
        <ArchiveMediaSections
          entry={entryWithContent}
          shouldTruncate={false}
          onImageClick={mockOnImageClick}
        />
      );

      // Assert
      expect(screen.queryByText('Show More')).not.toBeInTheDocument();
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    });
  });

  describe('handles empty states', () => {
    it('should not render images section when images array is empty', () => {
      // Arrange
      const entryWithEmptyImages = {
        ...baseEntry,
        images: [],
      };

      // Act
      const { container } = render(<ArchiveMediaSections entry={entryWithEmptyImages} onImageClick={mockOnImageClick} />);

      // Assert
      expect(container.querySelector('img')).not.toBeInTheDocument();
    });

    it('should not render text when content is empty', () => {
      // Arrange
      const entryWithEmptyContent = {
        ...baseEntry,
        content: '',
      };

      // Act
      render(<ArchiveMediaSections entry={entryWithEmptyContent} onImageClick={mockOnImageClick} />);

      // Assert
      expect(screen.queryByText(/./)).not.toBeInTheDocument();
    });
  });
});



