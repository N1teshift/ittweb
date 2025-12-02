import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MediaSelector from '../components/sections/MediaSelector';

describe('MediaSelector', () => {
  const mockOnVideoUrlChange = jest.fn();
  const mockOnFileUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders media selector', () => {
    it('should render file upload input', () => {
      // Act
      const { container } = render(
        <MediaSelector
          videoUrl=""
          onVideoUrlChange={mockOnVideoUrlChange}
          onFileUpload={mockOnFileUpload}
        />
      );

      // Assert
      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', 'image/*,.w3g');
      expect(fileInput).toHaveAttribute('multiple');
      expect(screen.getByText(/Upload Images or Replay/i)).toBeInTheDocument();
    });

    it('should render video URL input', () => {
      // Act
      const { container } = render(
        <MediaSelector
          videoUrl=""
          onVideoUrlChange={mockOnVideoUrlChange}
          onFileUpload={mockOnFileUpload}
        />
      );

      // Assert
      const videoInput = container.querySelector('input[type="url"]');
      expect(videoInput).toBeInTheDocument();
      expect(videoInput).toHaveAttribute('name', 'videoUrl');
      expect(screen.getByText(/Video URL/i)).toBeInTheDocument();
    });

    it('should display header by default', () => {
      // Act
      render(
        <MediaSelector
          videoUrl=""
          onVideoUrlChange={mockOnVideoUrlChange}
          onFileUpload={mockOnFileUpload}
        />
      );

      // Assert
      expect(screen.getByText(/Media \(Optional\)/i)).toBeInTheDocument();
    });

    it('should not display header when showHeader is false', () => {
      // Act
      render(
        <MediaSelector
          videoUrl=""
          onVideoUrlChange={mockOnVideoUrlChange}
          onFileUpload={mockOnFileUpload}
          showHeader={false}
        />
      );

      // Assert
      expect(screen.queryByText(/Media \(Optional\)/i)).not.toBeInTheDocument();
    });

    it('should display file upload instructions', () => {
      // Act
      render(
        <MediaSelector
          videoUrl=""
          onVideoUrlChange={mockOnVideoUrlChange}
          onFileUpload={mockOnFileUpload}
        />
      );

      // Assert
      expect(screen.getByText(/Images: Max 5MB each/i)).toBeInTheDocument();
      expect(screen.getByText(/Replays: .w3g files/i)).toBeInTheDocument();
    });
  });

  describe('handles user interactions', () => {
    it('should call onFileUpload when file is selected', async () => {
      // Arrange
      const user = userEvent.setup();
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      // Act
      const { container } = render(
        <MediaSelector
          videoUrl=""
          onVideoUrlChange={mockOnVideoUrlChange}
          onFileUpload={mockOnFileUpload}
        />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, file);

      // Assert
      expect(mockOnFileUpload).toHaveBeenCalled();
    });

    it('should call onVideoUrlChange when video URL changes', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      const { container } = render(
        <MediaSelector
          videoUrl=""
          onVideoUrlChange={mockOnVideoUrlChange}
          onFileUpload={mockOnFileUpload}
        />
      );

      const videoInput = container.querySelector('input[type="url"]') as HTMLInputElement;
      await user.type(videoInput, 'https://youtube.com/watch?v=test');

      // Assert
      expect(mockOnVideoUrlChange).toHaveBeenCalled();
    });

    it('should display video URL value', () => {
      // Act
      const { container } = render(
        <MediaSelector
          videoUrl="https://youtube.com/watch?v=test"
          onVideoUrlChange={mockOnVideoUrlChange}
          onFileUpload={mockOnFileUpload}
        />
      );

      // Assert
      const videoInput = container.querySelector('input[type="url"]') as HTMLInputElement;
      expect(videoInput).toHaveValue('https://youtube.com/watch?v=test');
    });
  });

  describe('handles error display', () => {
    it('should display video error when provided', () => {
      // Act
      render(
        <MediaSelector
          videoUrl=""
          onVideoUrlChange={mockOnVideoUrlChange}
          onFileUpload={mockOnFileUpload}
          videoError="Invalid video URL"
        />
      );

      // Assert
      expect(screen.getByText('Invalid video URL')).toBeInTheDocument();
    });

    it('should not display error when videoError is not provided', () => {
      // Act
      render(
        <MediaSelector
          videoUrl=""
          onVideoUrlChange={mockOnVideoUrlChange}
          onFileUpload={mockOnFileUpload}
        />
      );

      // Assert
      expect(screen.queryByText(/Invalid/i)).not.toBeInTheDocument();
    });
  });

  describe('handles file input attributes', () => {
    it('should accept images and w3g files', () => {
      // Act
      const { container } = render(
        <MediaSelector
          videoUrl=""
          onVideoUrlChange={mockOnVideoUrlChange}
          onFileUpload={mockOnFileUpload}
        />
      );

      // Assert
      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('accept', 'image/*,.w3g');
    });

    it('should allow multiple file selection', () => {
      // Act
      const { container } = render(
        <MediaSelector
          videoUrl=""
          onVideoUrlChange={mockOnVideoUrlChange}
          onFileUpload={mockOnFileUpload}
        />
      );

      // Assert
      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('multiple');
    });
  });
});



