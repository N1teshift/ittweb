import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SortToggle from '../components/sections/SortToggle';

describe('SortToggle', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders sort toggle', () => {
    it('should render both sort options', () => {
      // Act
      render(<SortToggle sortOrder="newest" onChange={mockOnChange} />);

      // Assert
      expect(screen.getByText('Newest First')).toBeInTheDocument();
      expect(screen.getByText('Oldest First')).toBeInTheDocument();
    });

    it('should highlight newest when sortOrder is newest', () => {
      // Act
      render(<SortToggle sortOrder="newest" onChange={mockOnChange} />);

      // Assert
      const newestButton = screen.getByText('Newest First');
      expect(newestButton).toHaveClass('bg-amber-600', 'text-white');
    });

    it('should highlight oldest when sortOrder is oldest', () => {
      // Act
      render(<SortToggle sortOrder="oldest" onChange={mockOnChange} />);

      // Assert
      const oldestButton = screen.getByText('Oldest First');
      expect(oldestButton).toHaveClass('bg-amber-600', 'text-white');
    });

    it('should show inactive state for non-selected option', () => {
      // Act
      render(<SortToggle sortOrder="newest" onChange={mockOnChange} />);

      // Assert
      const oldestButton = screen.getByText('Oldest First');
      expect(oldestButton).toHaveClass('bg-gray-800', 'text-gray-300');
    });
  });

  describe('handles user interactions', () => {
    it('should call onChange with newest when newest button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SortToggle sortOrder="oldest" onChange={mockOnChange} />);

      // Act
      const newestButton = screen.getByText('Newest First');
      await user.click(newestButton);

      // Assert
      expect(mockOnChange).toHaveBeenCalledWith('newest');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with oldest when oldest button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SortToggle sortOrder="newest" onChange={mockOnChange} />);

      // Act
      const oldestButton = screen.getByText('Oldest First');
      await user.click(oldestButton);

      // Assert
      expect(mockOnChange).toHaveBeenCalledWith('oldest');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange even when clicking already selected option', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<SortToggle sortOrder="newest" onChange={mockOnChange} />);

      // Act
      const newestButton = screen.getByText('Newest First');
      await user.click(newestButton);

      // Assert
      expect(mockOnChange).toHaveBeenCalledWith('newest');
    });
  });
});



