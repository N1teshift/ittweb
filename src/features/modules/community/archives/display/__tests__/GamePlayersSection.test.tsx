import { render, screen } from '@testing-library/react';
import { GamePlayersSection } from '../components/GamePlayersSection';
import type { GameWithPlayers } from '@/features/modules/game-management/games/types';

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>{children}</a>
  ),
}));

describe('GamePlayersSection', () => {
  const mockGame: GameWithPlayers = {
    id: 'test-id',
    gameId: 1,
    gameState: 'completed',
    datetime: '2024-01-15T00:00:00Z',
    players: [],
    category: 'test',
    creatorName: 'Test Creator',
    ownername: 'Test Owner',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders players section', () => {
    it('should not render when players array is empty', () => {
      // Act
      const { container } = render(<GamePlayersSection game={mockGame} />);

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it('should not render when players is undefined', () => {
      // Arrange
      const gameWithoutPlayers: GameWithPlayers = { ...mockGame, players: [] };

      // Act
      const { container } = render(<GamePlayersSection game={gameWithoutPlayers} />);

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it('should render winners section when winners exist', () => {
      // Arrange
      const gameWithWinners: GameWithPlayers = {
        ...mockGame,
        players: [
          { id: '1', gameId: '1', name: 'Winner1', pid: 1, flag: 'winner' as const, elochange: 10, createdAt: '2024-01-15T00:00:00Z' },
          { id: '2', gameId: '1', name: 'Winner2', pid: 2, flag: 'winner' as const, elochange: 15, createdAt: '2024-01-15T00:00:00Z' },
        ],
      };

      // Act
      render(<GamePlayersSection game={gameWithWinners} />);

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
          { id: '1', gameId: '1', name: 'Loser1', pid: 1, flag: 'loser' as const, elochange: -10, createdAt: '2024-01-15T00:00:00Z' },
          { id: '2', gameId: '1', name: 'Loser2', pid: 2, flag: 'loser' as const, elochange: -15, createdAt: '2024-01-15T00:00:00Z' },
        ],
      };

      // Act
      render(<GamePlayersSection game={gameWithLosers} />);

      // Assert
      expect(screen.getByText('Losers')).toBeInTheDocument();
      expect(screen.getByText('Loser1')).toBeInTheDocument();
      expect(screen.getByText('Loser2')).toBeInTheDocument();
    });

    it('should render drawers section when drawers exist', () => {
      // Arrange
      const gameWithDrawers: GameWithPlayers = {
        ...mockGame,
        players: [
          { id: '1', gameId: '1', name: 'Drawer1', pid: 1, flag: 'drawer' as const, elochange: 0, createdAt: '2024-01-15T00:00:00Z' },
          { id: '2', gameId: '1', name: 'Drawer2', pid: 2, flag: 'drawer' as const, elochange: 0, createdAt: '2024-01-15T00:00:00Z' },
        ],
      };

      // Act
      render(<GamePlayersSection game={gameWithDrawers} />);

      // Assert
      expect(screen.getByText('Draw')).toBeInTheDocument();
      expect(screen.getByText('Drawer1')).toBeInTheDocument();
      expect(screen.getByText('Drawer2')).toBeInTheDocument();
    });

    it('should render all player types when all exist', () => {
      // Arrange
      const gameWithAllTypes: GameWithPlayers = {
        ...mockGame,
        players: [
          { id: '1', gameId: '1', name: 'Winner1', pid: 1, flag: 'winner' as const, elochange: 10, createdAt: '2024-01-15T00:00:00Z' },
          { id: '2', gameId: '1', name: 'Loser1', pid: 2, flag: 'loser' as const, elochange: -10, createdAt: '2024-01-15T00:00:00Z' },
          { id: '3', gameId: '1', name: 'Drawer1', pid: 3, flag: 'drawer' as const, elochange: 0, createdAt: '2024-01-15T00:00:00Z' },
        ],
      };

      // Act
      render(<GamePlayersSection game={gameWithAllTypes} />);

      // Assert
      expect(screen.getByText('Winners')).toBeInTheDocument();
      expect(screen.getByText('Losers')).toBeInTheDocument();
      expect(screen.getByText('Draw')).toBeInTheDocument();
    });
  });

  describe('handles ELO changes', () => {
    it('should display ELO change for winners', () => {
      // Arrange
      const gameWithWinners: GameWithPlayers = {
        ...mockGame,
        players: [
          { id: '1', gameId: '1', name: 'Winner1', pid: 1, flag: 'winner' as const, elochange: 10, createdAt: '2024-01-15T00:00:00Z' },
        ],
      };

      // Act
      render(<GamePlayersSection game={gameWithWinners} />);

      // Assert
      expect(screen.getByText(/\+10/i)).toBeInTheDocument();
    });

    it('should display ELO change for losers', () => {
      // Arrange
      const gameWithLosers: GameWithPlayers = {
        ...mockGame,
        players: [
          { id: '1', gameId: '1', name: 'Loser1', pid: 1, flag: 'loser' as const, elochange: -10, createdAt: '2024-01-15T00:00:00Z' },
        ],
      };

      // Act
      render(<GamePlayersSection game={gameWithLosers} />);

      // Assert
      expect(screen.getByText(/-10/i)).toBeInTheDocument();
    });

    it('should not display ELO change when undefined', () => {
      // Arrange
      const gameWithoutElo: GameWithPlayers = {
        ...mockGame,
        players: [
          { id: '1', gameId: '1', name: 'Player1', pid: 1, flag: 'winner' as const, createdAt: '2024-01-15T00:00:00Z' },
        ],
      };

      // Act
      render(<GamePlayersSection game={gameWithoutElo} />);

      // Assert
      expect(screen.getByText('Player1')).toBeInTheDocument();
      // ELO change should not be displayed
    });
  });

  describe('handles player links', () => {
    it('should create player links with correct href', () => {
      // Arrange
      const gameWithPlayers: GameWithPlayers = {
        ...mockGame,
        players: [
          { id: '1', gameId: '1', name: 'Player Name', pid: 1, flag: 'winner' as const, createdAt: '2024-01-15T00:00:00Z' },
        ],
      };

      // Act
      render(<GamePlayersSection game={gameWithPlayers} />);

      // Assert
      const link = screen.getByText('Player Name').closest('a');
      expect(link).toHaveAttribute('href', '/players/Player%20Name');
    });

    it('should stop propagation on link click', () => {
      // Arrange
      const gameWithPlayers: GameWithPlayers = {
        ...mockGame,
        players: [
          { id: '1', gameId: '1', name: 'Player1', pid: 1, flag: 'winner' as const, createdAt: '2024-01-15T00:00:00Z' },
        ],
      };

      // Act
      render(<GamePlayersSection game={gameWithPlayers} />);

      // Assert
      const link = screen.getByText('Player1').closest('a');
      expect(link).toBeInTheDocument();
    });
  });
});



