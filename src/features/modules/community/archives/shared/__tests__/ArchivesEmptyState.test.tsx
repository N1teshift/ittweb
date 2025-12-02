import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArchivesEmptyState from '../components/ArchivesEmptyState';

describe('ArchivesEmptyState', () => {
  const mockOnAddClick = jest.fn();
  const mockOnSignInClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders empty state', () => {
    it('should display empty state message', () => {
      // Act
      render(
        <ArchivesEmptyState
          isAuthenticated={false}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      expect(screen.getByText('No Archives Yet')).toBeInTheDocument();
      expect(screen.getByText(/Be the first to contribute/i)).toBeInTheDocument();
    });

    it('should show sign in button when not authenticated', () => {
      // Act
      render(
        <ArchivesEmptyState
          isAuthenticated={false}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      expect(screen.getByText(/Sign in with Discord/i)).toBeInTheDocument();
      expect(screen.queryByText('Add First Entry')).not.toBeInTheDocument();
    });

    it('should show add button when authenticated', () => {
      // Act
      render(
        <ArchivesEmptyState
          isAuthenticated={true}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Assert
      expect(screen.getByText('Add First Entry')).toBeInTheDocument();
      expect(screen.queryByText(/Sign in with Discord/i)).not.toBeInTheDocument();
    });
  });

  describe('handles user interactions', () => {
    it('should call onSignInClick when sign in button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ArchivesEmptyState
          isAuthenticated={false}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Act
      const signInButton = screen.getByText(/Sign in with Discord/i);
      await user.click(signInButton);

      // Assert
      expect(mockOnSignInClick).toHaveBeenCalledTimes(1);
      expect(mockOnAddClick).not.toHaveBeenCalled();
    });

    it('should call onAddClick when add button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ArchivesEmptyState
          isAuthenticated={true}
          onAddClick={mockOnAddClick}
          onSignInClick={mockOnSignInClick}
        />
      );

      // Act
      const addButton = screen.getByText('Add First Entry');
      await user.click(addButton);

      // Assert
      expect(mockOnAddClick).toHaveBeenCalledTimes(1);
      expect(mockOnSignInClick).not.toHaveBeenCalled();
    });
  });
});



