import { render, screen } from '@testing-library/react';
import FormHeader from '../components/sections/FormHeader';

describe('FormHeader', () => {
  it('should display create mode header', () => {
    // Act
    render(<FormHeader mode="create" />);

    // Assert
    expect(screen.getByText('Add to Archives')).toBeInTheDocument();
  });

  it('should display edit mode header', () => {
    // Act
    render(<FormHeader mode="edit" />);

    // Assert
    expect(screen.getByText('Edit Archive Entry')).toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    // Act
    const { container } = render(<FormHeader mode="create" />);

    // Assert
    const header = container.querySelector('h2');
    expect(header).toHaveClass('font-medieval-brand', 'text-3xl', 'mb-6', 'text-center');
  });
});



