import { render, screen, waitFor } from '@testing-library/react';
import TwitchClipEmbed from '../components/TwitchClipEmbed';
import * as archiveService from '@/features/modules/community/archives/services';

// Mock archiveService
jest.mock('@/features/infrastructure/lib/archiveService', () => ({
  extractTwitchClipId: jest.fn((url: string) => {
    if (url.includes('twitch.tv/clip/')) {
      return 'test-clip-id';
    }
    return null;
  }),
}));

// Mock window.location.hostname for Twitch embed tests
beforeAll(() => {
  // Directly modify the hostname property for jsdom compatibility
  // jsdom allows direct property modification but not redefining the entire location
  (window.location as any).hostname = 'localhost';
});

afterAll(() => {
  // Reset hostname by directly setting it (ignore jsdom warnings)
  try {
    (window.location as any).hostname = 'example.com';
  } catch (e) {
    // Ignore jsdom navigation warnings
  }
});

describe('TwitchClipEmbed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process.env
    delete process.env.NEXT_PUBLIC_TWITCH_PARENT;
  });

  describe('renders Twitch embed', () => {
    it('should render Twitch iframe with correct clip ID', async () => {
      // Arrange
      const url = 'https://twitch.tv/clip/test-clip-id';
      const title = 'Test Clip';

      // Act
      render(<TwitchClipEmbed url={url} title={title} />);

      // Assert
      await waitFor(() => {
        const iframe = screen.getByTitle(title);
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute('src', expect.stringContaining('test-clip-id'));
        expect(iframe).toHaveAttribute('src', expect.stringContaining('clips.twitch.tv/embed'));
      });
    });

    it('should include parent parameter in embed URL', async () => {
      // Arrange
      const url = 'https://twitch.tv/clip/test-clip-id';
      const title = 'Test Clip';

      // Act
      render(<TwitchClipEmbed url={url} title={title} />);

      // Assert
      await waitFor(() => {
        const iframe = screen.getByTitle(title);
        expect(iframe).toBeInTheDocument();
        const src = iframe.getAttribute('src');
        expect(src).toContain('parent=');
      }, { timeout: 3000 });
    });

    it('should use NEXT_PUBLIC_TWITCH_PARENT if set', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_TWITCH_PARENT = 'example.com,test.com';
      const url = 'https://twitch.tv/clip/test-clip-id';
      const title = 'Test Clip';

      // Act
      render(<TwitchClipEmbed url={url} title={title} />);

      // Assert
      await waitFor(() => {
        const iframe = screen.getByTitle(title);
        expect(iframe).toBeInTheDocument();
        const src = iframe.getAttribute('src');
        expect(src).toContain('parent=example.com');
        expect(src).toContain('parent=test.com');
      }, { timeout: 3000 });
    });
  });

  describe('handles clip URL parsing', () => {
    it('should extract clip ID from Twitch URL', () => {
      // Arrange
      const extractTwitchClipId = archiveService.extractTwitchClipId as jest.MockedFunction<typeof archiveService.extractTwitchClipId>;
      const url = 'https://twitch.tv/clip/test-clip-id';

      // Act
      render(<TwitchClipEmbed url={url} title="Test" />);

      // Assert
      expect(extractTwitchClipId).toHaveBeenCalledWith(url);
    });
  });

  describe('handles invalid URLs', () => {
    it('should display error for invalid Twitch clip URL', () => {
      // Arrange
      const extractTwitchClipId = archiveService.extractTwitchClipId as jest.MockedFunction<typeof archiveService.extractTwitchClipId>;
      extractTwitchClipId.mockReturnValueOnce(null);
      const url = 'https://invalid-url.com';
      const title = 'Invalid Clip';

      // Act
      render(<TwitchClipEmbed url={url} title={title} />);

      // Assert
      expect(screen.getByText(/Unable to load Twitch clip/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid clip URL/i)).toBeInTheDocument();
    });

    it('should not render iframe for invalid URL', () => {
      // Arrange
      const extractTwitchClipId = archiveService.extractTwitchClipId as jest.MockedFunction<typeof archiveService.extractTwitchClipId>;
      extractTwitchClipId.mockReturnValueOnce(null);
      const url = 'https://invalid-url.com';

      // Act
      render(<TwitchClipEmbed url={url} title="Test" />);

      // Assert
      const iframe = screen.queryByTitle('Test');
      expect(iframe).not.toBeInTheDocument();
    });
  });

  describe('handles iframe attributes', () => {
    it('should set correct iframe attributes', async () => {
      // Arrange
      const url = 'https://twitch.tv/clip/test-clip-id';
      const title = 'Test Clip';

      // Act
      render(<TwitchClipEmbed url={url} title={title} />);

      // Assert
      await waitFor(() => {
        const iframe = screen.getByTitle(title);
        expect(iframe).toHaveAttribute('allowFullScreen');
        expect(iframe).toHaveAttribute('scrolling', 'no');
        expect(iframe).toHaveClass('h-[360px]');
      });
    });

    it('should include autoplay=false in embed URL', async () => {
      // Arrange
      const url = 'https://twitch.tv/clip/test-clip-id';
      const title = 'Test Clip';

      // Act
      render(<TwitchClipEmbed url={url} title={title} />);

      // Assert
      await waitFor(() => {
        const iframe = screen.getByTitle(title);
        expect(iframe).toBeInTheDocument();
        const src = iframe.getAttribute('src');
        expect(src).toContain('autoplay=false');
      }, { timeout: 3000 });
    });
  });
});


