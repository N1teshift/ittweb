import { render, screen } from '@testing-library/react';
import YouTubeEmbed from '../components/YouTubeEmbed';
import * as archiveService from '@/features/modules/community/archives/services';

// Mock archiveService
jest.mock('@/features/infrastructure/lib/archiveService', () => ({
  extractYouTubeId: jest.fn((url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'test-video-id';
    }
    return null;
  }),
}));

describe('YouTubeEmbed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders YouTube embed', () => {
    it('should render YouTube iframe with correct video ID', () => {
      // Arrange
      const url = 'https://www.youtube.com/watch?v=test-video-id';
      const title = 'Test Video';

      // Act
      render(<YouTubeEmbed url={url} title={title} />);

      // Assert
      const iframe = screen.getByTitle(title);
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', expect.stringContaining('test-video-id'));
      expect(iframe).toHaveAttribute('src', expect.stringContaining('youtube-nocookie.com'));
    });

    it('should include privacy-enhanced parameters', () => {
      // Arrange
      const url = 'https://www.youtube.com/watch?v=test-video-id';
      const title = 'Test Video';

      // Act
      render(<YouTubeEmbed url={url} title={title} />);

      // Assert
      const iframe = screen.getByTitle(title);
      const src = iframe.getAttribute('src');
      expect(src).toContain('rel=0');
      expect(src).toContain('modestbranding=1');
      expect(src).toContain('enablejsapi=0');
    });

    it('should handle youtu.be short URLs', () => {
      // Arrange
      const extractYouTubeId = archiveService.extractYouTubeId as jest.MockedFunction<typeof archiveService.extractYouTubeId>;
      extractYouTubeId.mockReturnValueOnce('short-video-id');
      const url = 'https://youtu.be/short-video-id';
      const title = 'Short URL Video';

      // Act
      render(<YouTubeEmbed url={url} title={title} />);

      // Assert
      const iframe = screen.getByTitle(title);
      expect(iframe).toHaveAttribute('src', expect.stringContaining('short-video-id'));
    });
  });

  describe('handles video ID extraction', () => {
    it('should extract video ID from full YouTube URL', () => {
      // Arrange
      const extractYouTubeId = archiveService.extractYouTubeId as jest.MockedFunction<typeof archiveService.extractYouTubeId>;
      const url = 'https://www.youtube.com/watch?v=full-video-id';

      // Act
      render(<YouTubeEmbed url={url} title="Test" />);

      // Assert
      expect(extractYouTubeId).toHaveBeenCalledWith(url);
    });

    it('should extract video ID from embed URL', () => {
      // Arrange
      const extractYouTubeId = archiveService.extractYouTubeId as jest.MockedFunction<typeof archiveService.extractYouTubeId>;
      extractYouTubeId.mockReturnValueOnce('embed-video-id');
      const url = 'https://www.youtube.com/embed/embed-video-id';

      // Act
      render(<YouTubeEmbed url={url} title="Test" />);

      // Assert
      expect(extractYouTubeId).toHaveBeenCalledWith(url);
    });
  });

  describe('handles invalid URLs', () => {
    it('should display error for invalid YouTube URL', () => {
      // Arrange
      const extractYouTubeId = archiveService.extractYouTubeId as jest.MockedFunction<typeof archiveService.extractYouTubeId>;
      extractYouTubeId.mockReturnValueOnce(null);
      const url = 'https://invalid-url.com';
      const title = 'Invalid Video';

      // Act
      render(<YouTubeEmbed url={url} title={title} />);

      // Assert
      expect(screen.getByText('Invalid YouTube URL')).toBeInTheDocument();
      expect(screen.getByText(url)).toBeInTheDocument();
    });

    it('should not render iframe for invalid URL', () => {
      // Arrange
      const extractYouTubeId = archiveService.extractYouTubeId as jest.MockedFunction<typeof archiveService.extractYouTubeId>;
      extractYouTubeId.mockReturnValueOnce(null);
      const url = 'https://invalid-url.com';

      // Act
      render(<YouTubeEmbed url={url} title="Test" />);

      // Assert
      const iframe = screen.queryByRole('img');
      expect(iframe).not.toBeInTheDocument();
    });
  });

  describe('handles iframe attributes', () => {
    it('should set correct iframe attributes', () => {
      // Arrange
      const url = 'https://www.youtube.com/watch?v=test-video-id';
      const title = 'Test Video';

      // Act
      render(<YouTubeEmbed url={url} title={title} />);

      // Assert
      const iframe = screen.getByTitle(title);
      expect(iframe).toHaveAttribute('allow', expect.stringContaining('autoplay'));
      expect(iframe).toHaveAttribute('allow', expect.stringContaining('encrypted-media'));
      expect(iframe).toHaveAttribute('allowFullScreen');
      expect(iframe).toHaveAttribute('loading', 'lazy');
      expect(iframe).toHaveAttribute('sandbox');
    });
  });
});



