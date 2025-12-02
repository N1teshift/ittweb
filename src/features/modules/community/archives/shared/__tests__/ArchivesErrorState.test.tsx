import { render, screen } from '@testing-library/react';
import ArchivesErrorState from '../components/ArchivesErrorState';

describe('ArchivesErrorState', () => {
  it('should render error message', () => {
    // Arrange
    const errorMessage = 'Failed to load archives';

    // Act
    render(<ArchivesErrorState error={errorMessage} />);

    // Assert
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should display different error messages', () => {
    // Arrange
    const errorMessage = 'Network error occurred';

    // Act
    render(<ArchivesErrorState error={errorMessage} />);

    // Assert
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should have error styling', () => {
    // Arrange
    const { container } = render(<ArchivesErrorState error="Test error" />);

    // Assert
    const errorDiv = container.querySelector('.bg-red-900\\/50');
    expect(errorDiv).toBeInTheDocument();
    expect(errorDiv).toHaveClass('border', 'border-red-500');
  });

  it('should handle long error messages', () => {
    // Arrange
    const longError = 'This is a very long error message that might wrap to multiple lines and should still be displayed correctly';

    // Act
    render(<ArchivesErrorState error={longError} />);

    // Assert
    expect(screen.getByText(longError)).toBeInTheDocument();
  });
});



