import { render, screen } from '@testing-library/react';
import ArchivesLoadingState from '../components/ArchivesLoadingState';

describe('ArchivesLoadingState', () => {
  it('should render loading spinner', () => {
    // Act
    const { container } = render(<ArchivesLoadingState />);

    // Assert
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should display loading message', () => {
    // Act
    render(<ArchivesLoadingState />);

    // Assert
    expect(screen.getByText('Loading archives...')).toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    // Act
    const { container } = render(<ArchivesLoadingState />);

    // Assert
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('rounded-full', 'h-12', 'w-12', 'border-b-2', 'border-amber-500');
  });
});



