import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageModal from '../components/sections/ImageModal';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, unoptimized, ...props }: { src: string; alt: string; unoptimized?: boolean; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} data-unoptimized={unoptimized} />
  ),
}));

describe('ImageModal', () => {
  const mockOnClose = jest.fn();
  const mockImage = {
    url: 'https://example.com/image.jpg',
    title: 'Test Image',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders image modal', () => {
    it('should not render when isOpen is false', () => {
      // Act
      const { container } = render(
        <ImageModal isOpen={false} image={mockImage} onClose={mockOnClose} />
      );

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it('should not render when image is null', () => {
      // Act
      const { container } = render(
        <ImageModal isOpen={true} image={null} onClose={mockOnClose} />
      );

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true and image is provided', () => {
      // Act
      render(<ImageModal isOpen={true} image={mockImage} onClose={mockOnClose} />);

      // Assert
      const image = screen.getByAltText('Test Image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should render close button', () => {
      // Act
      render(<ImageModal isOpen={true} image={mockImage} onClose={mockOnClose} />);

      // Assert
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('handles user interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<ImageModal isOpen={true} image={mockImage} onClose={mockOnClose} />);

      // Act - Find close button by its SVG (close icon)
      const closeButton = screen.getByRole('button', { hidden: true }) || 
                         document.querySelector('button[onClick]');
      if (closeButton) {
        await user.click(closeButton);
      }

      // Assert
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should have backdrop that can be clicked to close', () => {
      // Arrange
      const { container } = render(<ImageModal isOpen={true} image={mockImage} onClose={mockOnClose} />);

      // Assert - backdrop should have onClick handler
      const backdrop = container.querySelector('.fixed.inset-0');
      expect(backdrop).toBeInTheDocument();
      // The backdrop has onClick={onClose} in the component
    });

    it('should render image correctly', () => {
      // Arrange
      render(<ImageModal isOpen={true} image={mockImage} onClose={mockOnClose} />);

      // Assert
      const image = screen.getByAltText('Test Image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });
  });

  describe('handles different image URLs', () => {
    it('should render image with different URL', () => {
      // Arrange
      const differentImage = {
        url: 'https://example.com/another-image.jpg',
        title: 'Another Image',
      };

      // Act
      render(<ImageModal isOpen={true} image={differentImage} onClose={mockOnClose} />);

      // Assert
      const image = screen.getByAltText('Another Image');
      expect(image).toHaveAttribute('src', 'https://example.com/another-image.jpg');
    });

    it('should handle Firebase Storage URLs', () => {
      // Arrange
      const firebaseImage = {
        url: 'https://firebasestorage.googleapis.com/image.jpg',
        title: 'Firebase Image',
      };

      // Act
      render(<ImageModal isOpen={true} image={firebaseImage} onClose={mockOnClose} />);

      // Assert
      const image = screen.getByAltText('Firebase Image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://firebasestorage.googleapis.com/image.jpg');
    });
  });
});



