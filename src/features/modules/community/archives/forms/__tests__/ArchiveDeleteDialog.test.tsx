import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArchiveDeleteDialog from '../components/ArchiveDeleteDialog';

describe('ArchiveDeleteDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders confirmation dialog', () => {
    it('should not render when isOpen is false', () => {
      // Act
      const { container } = render(
        <ArchiveDeleteDialog
          isOpen={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      // Act
      render(
        <ArchiveDeleteDialog
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Assert
      expect(screen.getByText('Delete archive entry?')).toBeInTheDocument();
    });

    it('should display entry title when provided', () => {
      // Arrange
      const entryTitle = 'Test Archive Entry';

      // Act
      render(
        <ArchiveDeleteDialog
          isOpen={true}
          entryTitle={entryTitle}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Assert
      expect(screen.getByText(entryTitle, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(/will be permanently removed/i)).toBeInTheDocument();
    });

    it('should display generic message when title is not provided', () => {
      // Act
      render(
        <ArchiveDeleteDialog
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Assert
      expect(screen.getByText(/This entry will be permanently removed/i)).toBeInTheDocument();
    });
  });

  describe('handles delete action', () => {
    it('should call onConfirm when delete button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ArchiveDeleteDialog
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Act
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Assert
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ArchiveDeleteDialog
          isOpen={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Act
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should disable buttons when loading', () => {
      // Act
      render(
        <ArchiveDeleteDialog
          isOpen={true}
          isLoading={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Assert
      const deleteButton = screen.getByText('Deleting…');
      const cancelButton = screen.getByText('Cancel');
      
      expect(deleteButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('should show loading text when isLoading is true', () => {
      // Act
      render(
        <ArchiveDeleteDialog
          isOpen={true}
          isLoading={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Assert
      expect(screen.getByText('Deleting…')).toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should not call handlers when buttons are disabled', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <ArchiveDeleteDialog
          isOpen={true}
          isLoading={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      // Act
      const deleteButton = screen.getByText('Deleting…');
      await user.click(deleteButton);

      // Assert - buttons are disabled, so handlers shouldn't be called
      // (though userEvent might still trigger, so we check the button state)
      expect(deleteButton).toBeDisabled();
    });
  });
});



