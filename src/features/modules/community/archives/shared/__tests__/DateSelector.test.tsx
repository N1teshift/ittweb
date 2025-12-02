import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateSelector from '../components/sections/DateSelector';

describe('DateSelector', () => {
  const mockOnFieldChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders date selector', () => {
    it('should render date type radio buttons', () => {
      // Act
      render(
        <DateSelector
          dateType="single"
          singleDate=""
          approximateText=""
          onFieldChange={mockOnFieldChange}
        />
      );

      // Assert
      expect(screen.getByLabelText('Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Undated')).toBeInTheDocument();
    });

    it('should show date input when dateType is single', () => {
      // Act
      render(
        <DateSelector
          dateType="single"
          singleDate="2024-01-15"
          approximateText=""
          onFieldChange={mockOnFieldChange}
        />
      );

      // Assert
      const dateInput = document.querySelector('input[type="date"]') || 
                       document.querySelector('input[type="number"]');
      expect(dateInput).toBeInTheDocument();
    });

    it('should show approximate text input when dateType is undated', () => {
      // Act
      render(
        <DateSelector
          dateType="undated"
          singleDate=""
          approximateText="Early 2016"
          onFieldChange={mockOnFieldChange}
        />
      );

      // Assert
      const approximateInput = screen.getByPlaceholderText(/e.g., Early 2016/i);
      expect(approximateInput).toBeInTheDocument();
      expect(approximateInput).toHaveValue('Early 2016');
    });
  });

  describe('handles date type selection', () => {
    it('should call onFieldChange when date type changes', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <DateSelector
          dateType="single"
          singleDate=""
          approximateText=""
          onFieldChange={mockOnFieldChange}
        />
      );

      // Act
      const undatedRadio = screen.getByLabelText('Undated');
      await user.click(undatedRadio);

      // Assert
      expect(mockOnFieldChange).toHaveBeenCalled();
    });
  });

  describe('handles date precision', () => {
    it('should show year precision option when dateType is single', () => {
      // Act
      render(
        <DateSelector
          dateType="single"
          singleDate="2024"
          approximateText=""
          onFieldChange={mockOnFieldChange}
        />
      );

      // Assert
      expect(screen.getByLabelText('Year only')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Date')).toBeInTheDocument();
    });

    it('should use year input when precision is year', () => {
      // Act
      render(
        <DateSelector
          dateType="single"
          singleDate="2024"
          approximateText=""
          onFieldChange={mockOnFieldChange}
        />
      );

      // Assert
      const yearInput = screen.getByPlaceholderText('2025');
      expect(yearInput).toBeInTheDocument();
      expect(yearInput).toHaveAttribute('type', 'number');
    });

    it('should use date input when precision is day', () => {
      // Act
      render(
        <DateSelector
          dateType="single"
          singleDate="2024-01-15"
          approximateText=""
          onFieldChange={mockOnFieldChange}
        />
      );

      // Assert
      const dateInput = document.querySelector('input[type="date"]');
      expect(dateInput).toBeInTheDocument();
    });

    it('should change precision when radio button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <DateSelector
          dateType="single"
          singleDate="2024-01-15"
          approximateText=""
          onFieldChange={mockOnFieldChange}
        />
      );

      // Act
      const yearOnlyRadio = screen.getByLabelText('Year only');
      await user.click(yearOnlyRadio);

      // Assert
      expect(mockOnFieldChange).toHaveBeenCalled();
    });
  });

  describe('handles date input', () => {
    it('should call onFieldChange when date input changes', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <DateSelector
          dateType="single"
          singleDate=""
          approximateText=""
          onFieldChange={mockOnFieldChange}
        />
      );

      // Act
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      if (dateInput) {
        await user.type(dateInput, '2024-01-15');
      }

      // Assert
      expect(mockOnFieldChange).toHaveBeenCalled();
    });

    it('should call onFieldChange when approximate text changes', async () => {
      // Arrange
      const user = userEvent.setup();
      render(
        <DateSelector
          dateType="undated"
          singleDate=""
          approximateText=""
          onFieldChange={mockOnFieldChange}
        />
      );

      // Act
      const approximateInput = screen.getByPlaceholderText(/e.g., Early 2016/i);
      await user.type(approximateInput, 'Early 2016');

      // Assert
      expect(mockOnFieldChange).toHaveBeenCalled();
    });
  });

  describe('handles different date formats', () => {
    it('should handle year-only format', () => {
      // Act
      render(
        <DateSelector
          dateType="single"
          singleDate="2024"
          approximateText=""
          onFieldChange={mockOnFieldChange}
        />
      );

      // Assert
      const yearInput = screen.getByPlaceholderText('2025');
      expect(yearInput).toHaveValue(2024);
    });

    it('should handle full date format', () => {
      // Act
      render(
        <DateSelector
          dateType="single"
          singleDate="2024-01-15"
          approximateText=""
          onFieldChange={mockOnFieldChange}
        />
      );

      // Assert
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      expect(dateInput).toBeInTheDocument();
      // The component may convert YYYY-MM to YYYY-MM-01 for date input
      expect(dateInput.value).toMatch(/2024-01/);
    });
  });
});



