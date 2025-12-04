import { render, screen } from '@testing-library/react';
import { GameDetailsSection } from '../components/GameDetailsSection';
import type { GameWithPlayers } from '@/features/modules/game-management/games/types';

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock Card component
jest.mock('@/features/infrastructure/components/containers/Card', () => ({
  Card: ({ children, className, variant }: any) => (
    <div className={className} data-variant={variant}>{children}</div>
  ),
}));

describe('GameDetailsSection', () => {
  const mockGame: GameWithPlayers = {
    id: 'test-id',
    gameId: 1,
    gameState: 'completed',
    datetime: '2024-01-15T10:30:00Z',
    players: [],
    category: 'test',
    creatorName: 'Test Creator',
    ownername: 'Test Owner',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  };

  describe('renders game details', () => {
    it('should render game ID', () => {
      // Act
      render(<GameDetailsSection game={mockGame} />);

      // Assert
      expect(screen.getByText('Game #1')).toBeInTheDocument();
    });

    it('should render game date', () => {
      // Act
      render(<GameDetailsSection game={mockGame} />);

      // Assert
      expect(screen.getByText(/Date:/i)).toBeInTheDocument();
    });

    it('should render category', () => {
      // Act
      render(<GameDetailsSection game={mockGame} />);

      // Assert
      expect(screen.getByText(/Category:/i)).toBeInTheDocument();
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('should render creator name', () => {
      // Act
      render(<GameDetailsSection game={mockGame} />);

      // Assert
      expect(screen.getByText(/Creator:/i)).toBeInTheDocument();
      expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    it('should render owner name', () => {
      // Act
      render(<GameDetailsSection game={mockGame} />);

      // Assert
      expect(screen.getByText(/Owner:/i)).toBeInTheDocument();
      expect(screen.getByText('Test Owner')).toBeInTheDocument();
    });

    it('should render duration when provided', () => {
      // Arrange
      const gameWithDuration = {
        ...mockGame,
        duration: 3600,
      };

      // Act
      render(<GameDetailsSection game={gameWithDuration} />);

      // Assert
      expect(screen.getByText(/Duration:/i)).toBeInTheDocument();
    });

    it('should not render duration when not provided', () => {
      // Act
      render(<GameDetailsSection game={mockGame} />);

      // Assert
      expect(screen.queryByText(/Duration:/i)).not.toBeInTheDocument();
    });

    it('should render map when provided', () => {
      // Arrange
      const gameWithMap = {
        ...mockGame,
        map: 'Maps\\TestMap.w3x',
      };

      // Act
      render(<GameDetailsSection game={gameWithMap} />);

      // Assert
      expect(screen.getByText(/Map:/i)).toBeInTheDocument();
      expect(screen.getByText('TestMap.w3x')).toBeInTheDocument();
    });

    it('should not render map when not provided', () => {
      // Act
      render(<GameDetailsSection game={mockGame} />);

      // Assert
      expect(screen.queryByText(/Map:/i)).not.toBeInTheDocument();
    });
  });

  describe('handles replay download', () => {
    it('should render replay download link when replayUrl is provided', () => {
      // Arrange
      const gameWithReplay = {
        ...mockGame,
        replayUrl: 'https://example.com/replay.w3g',
        replayFileName: 'test-replay.w3g',
      };

      // Act
      render(<GameDetailsSection game={gameWithReplay} />);

      // Assert
      const downloadLink = screen.getByText(/Download replay/i);
      expect(downloadLink).toBeInTheDocument();
      expect(downloadLink.closest('a')).toHaveAttribute('href', 'https://example.com/replay.w3g');
      expect(downloadLink.closest('a')).toHaveAttribute('download', 'test-replay.w3g');
    });

    it('should use default filename when replayFileName is not provided', () => {
      // Arrange
      const gameWithReplay = {
        ...mockGame,
        replayUrl: 'https://example.com/replay.w3g',
      };

      // Act
      render(<GameDetailsSection game={gameWithReplay} />);

      // Assert
      const downloadLink = screen.getByText(/Download replay/i);
      expect(downloadLink.closest('a')).toHaveAttribute('download', 'replay.w3g');
    });

    it('should not render replay link when replayUrl is not provided', () => {
      // Act
      render(<GameDetailsSection game={mockGame} />);

      // Assert
      expect(screen.queryByText(/Download replay/i)).not.toBeInTheDocument();
    });
  });

  describe('renders player sections', () => {
    it('should render winners section when winners exist', () => {
      // Arrange
      const gameWithWinners: GameWithPlayers = {
        ...mockGame,
        players: [
          { id: '1', gameId: '1', name: 'Winner1', pid: 1, flag: 'winner' as const, elochange: 10, createdAt: '2024-01-15T10:30:00Z' },
          { id: '2', gameId: '1', name: 'Winner2', pid: 2, flag: 'winner' as const, elochange: 15, createdAt: '2024-01-15T10:30:00Z' },
        ],
      };

      // Act
      render(<GameDetailsSection game={gameWithWinners} />);

      // Assert
      expect(screen.getByText('Winners')).toBeInTheDocument();
      expect(screen.getByText('Winner1')).toBeInTheDocument();
      expect(screen.getByText('Winner2')).toBeInTheDocument();
    });

    it('should render losers section when losers exist', () => {
      // Arrange
      const gameWithLosers: GameWithPlayers = {
        ...mockGame,
        players: [
          { id: '1', gameId: '1', name: 'Loser1', pid: 1, flag: 'loser' as const, elochange: -10, createdAt: '2024-01-15T10:30:00Z' },
        ],
      };

      // Act
      render(<GameDetailsSection game={gameWithLosers} />);

      // Assert
      expect(screen.getByText('Losers')).toBeInTheDocument();
      expect(screen.getByText('Loser1')).toBeInTheDocument();
    });

    it('should render drawers section when drawers exist', () => {
      // Arrange
      const gameWithDrawers: GameWithPlayers = {
        ...mockGame,
        players: [
          { id: '1', gameId: '1', name: 'Drawer1', pid: 1, flag: 'drawer' as const, elochange: 0, createdAt: '2024-01-15T10:30:00Z' },
        ],
      };

      // Act
      render(<GameDetailsSection game={gameWithDrawers} />);

      // Assert
      expect(screen.getByText('Draw')).toBeInTheDocument();
      expect(screen.getByText('Drawer1')).toBeInTheDocument();
    });

    it('should render all player sections when all types exist', () => {
      // Arrange
      const gameWithAllTypes: GameWithPlayers = {
        ...mockGame,
        players: [
          { id: '1', gameId: '1', name: 'Winner1', pid: 1, flag: 'winner' as const, elochange: 10, createdAt: '2024-01-15T10:30:00Z' },
          { id: '2', gameId: '1', name: 'Loser1', pid: 2, flag: 'loser' as const, elochange: -10, createdAt: '2024-01-15T10:30:00Z' },
          { id: '3', gameId: '1', name: 'Drawer1', pid: 3, flag: 'drawer' as const, elochange: 0, createdAt: '2024-01-15T10:30:00Z' },
        ],
      };

      // Act
      render(<GameDetailsSection game={gameWithAllTypes} />);

      // Assert
      expect(screen.getByText('Winners')).toBeInTheDocument();
      expect(screen.getByText('Losers')).toBeInTheDocument();
      expect(screen.getByText('Draw')).toBeInTheDocument();
    });

    it('should not render player sections when no players exist', () => {
      // Act
      render(<GameDetailsSection game={mockGame} />);

      // Assert
      expect(screen.queryByText('Winners')).not.toBeInTheDocument();
      expect(screen.queryByText('Losers')).not.toBeInTheDocument();
      expect(screen.queryByText('Draw')).not.toBeInTheDocument();
    });
  });

  describe('handles ELO changes', () => {
    it('should display ELO change for winners', () => {
      // Arrange
      const gameWithWinners: GameWithPlayers = {
        ...mockGame,
        players: [
          { id: '1', gameId: '1', name: 'Winner1', pid: 1, flag: 'winner' as const, elochange: 10, createdAt: '2024-01-15T10:30:00Z' },
        ],
      };

      // Act
      render(<GameDetailsSection game={gameWithWinners} />);

      // Assert
      expect(screen.getByText(/\+10/i)).toBeInTheDocument();
    });

    it('should display ELO change for losers', () => {
      // Arrange
      const gameWithLosers: GameWithPlayers = {
        ...mockGame,
        players: [
          { id: '1', gameId: '1', name: 'Loser1', pid: 1, flag: 'loser' as const, elochange: -10, createdAt: '2024-01-15T10:30:00Z' },
        ],
      };

      // Act
      render(<GameDetailsSection game={gameWithLosers} />);

      // Assert
      expect(screen.getByText(/-10/i)).toBeInTheDocument();
    });
  });

  describe('handles player links', () => {
    it('should create player links with correct href', () => {
      // Arrange
      const gameWithPlayers: GameWithPlayers = {
        ...mockGame,
        players: [
          { id: '1', gameId: '1', name: 'Player Name', pid: 1, flag: 'winner' as const, createdAt: '2024-01-15T10:30:00Z' },
        ],
      };

      // Act
      render(<GameDetailsSection game={gameWithPlayers} />);

      // Assert
      const link = screen.getByText('Player Name').closest('a');
      expect(link).toHaveAttribute('href', '/players/Player%20Name');
    });
  });
});



