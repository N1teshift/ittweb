import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClassesPage } from '../ClassesPage';

// Mock the useClassesData hook
jest.mock('../../hooks/useClassesData', () => ({
  useClassesData: jest.fn(),
}));

// Mock PageHero component
jest.mock('@/features/infrastructure/components', () => ({
  PageHero: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="page-hero">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}));

// Mock Card component
jest.mock('@/features/infrastructure/components/containers/Card', () => ({
  Card: ({ children, variant, className }: any) => (
    <div data-testid={`card-${variant || 'default'}`} className={className}>
      {children}
    </div>
  ),
}));

const mockUseClassesData = require('../../hooks/useClassesData').useClassesData;

describe('ClassesPage', () => {
  const mockClassesData = [
    {
      id: 'Warrior',
      category: 'melee',
      totalGames: 150,
      totalWins: 90,
      totalLosses: 60,
      winRate: 0.6,
      topPlayers: [
        {
          playerName: 'Player1',
          wins: 50,
          losses: 20,
          winRate: 0.714,
          elo: 1800,
        },
      ],
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'Mage',
      category: 'ranged',
      totalGames: 120,
      totalWins: 75,
      totalLosses: 45,
      winRate: 0.625,
      topPlayers: [
        {
          playerName: 'Player2',
          wins: 40,
          losses: 15,
          winRate: 0.727,
          elo: 1750,
        },
      ],
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ];

  const defaultProps = {
    pageNamespaces: ['common', 'classes'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockUseClassesData.mockReturnValue({
      classes: [],
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<ClassesPage {...defaultProps} />);

    expect(screen.getByTestId('page-hero')).toBeInTheDocument();
    expect(screen.getByText('Class Statistics')).toBeInTheDocument();
    expect(screen.getByTestId('card-medieval')).toBeInTheDocument();
    // Loading state shows animated pulse elements
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders error state when data fetch fails', () => {
    const mockError = new Error('Failed to load classes data');
    mockUseClassesData.mockReturnValue({
      classes: [],
      isLoading: false,
      error: mockError,
      refetch: jest.fn(),
    });

    render(<ClassesPage {...defaultProps} />);

    expect(screen.getByTestId('page-hero')).toBeInTheDocument();
    expect(screen.getByText('Error: Failed to load classes data')).toBeInTheDocument();
  });

  it('renders classes data when loaded successfully', async () => {
    mockUseClassesData.mockReturnValue({
      classes: mockClassesData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ClassesPage {...defaultProps} />);

    // Check page header
    expect(screen.getByTestId('page-hero')).toBeInTheDocument();
    expect(screen.getByText('Class Statistics')).toBeInTheDocument();

    // Check category filter exists
    expect(screen.getByText('Filter by Category')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    // Check classes are displayed
    await waitFor(() => {
      expect(screen.getByText('Warrior')).toBeInTheDocument();
      expect(screen.getByText('Mage')).toBeInTheDocument();
    });

    // Check win rates are displayed (component shows decimal as-is with %)
    expect(screen.getAllByText('0.6%')).toHaveLength(2); // Both classes show 0.6%
  });

  it('filters classes by category when category is selected', async () => {
    mockUseClassesData.mockReturnValue({
      classes: mockClassesData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ClassesPage {...defaultProps} />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Warrior')).toBeInTheDocument();
    });

    // Change category filter
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1v1' } });

    // Verify useClassesData was called with the new category
    expect(mockUseClassesData).toHaveBeenCalledWith('1v1');
  });

  it('displays class details correctly', async () => {
    mockUseClassesData.mockReturnValue({
      classes: mockClassesData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ClassesPage {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Warrior')).toBeInTheDocument();
    });

    // Check that game counts are displayed
    expect(screen.getByText('150')).toBeInTheDocument(); // Warrior total games
    expect(screen.getByText('120')).toBeInTheDocument(); // Mage total games

    // Check that win/loss records are displayed
    expect(screen.getByText('90W - 60L')).toBeInTheDocument(); // Warrior record
    expect(screen.getByText('75W - 45L')).toBeInTheDocument(); // Mage record
  });

});

