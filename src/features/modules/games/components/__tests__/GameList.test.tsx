import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameList } from '../GameList';
import type { Game } from '../../types';

jest.mock('../GameCard', () => ({
  GameCard: ({ game }: { game: Game }) => <div data-testid="game-card">Game {game.gameId}</div>,
}));

jest.mock('../../hooks/useGames', () => ({
  useGames: jest.fn(),
}));

const mockedUseGames = jest.requireMock('../../hooks/useGames').useGames as jest.Mock;

describe('GameList', () => {
  it('shows loading placeholders', () => {
    mockedUseGames.mockReturnValue({ games: [], loading: true, error: null });

    const { container } = render(<GameList />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows error message', () => {
    mockedUseGames.mockReturnValue({ games: [], loading: false, error: new Error('Boom') });

    render(<GameList />);

    expect(screen.getByText('Error loading games: Boom')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    mockedUseGames.mockReturnValue({ games: [], loading: false, error: null });

    render(<GameList />);

    expect(screen.getByText('No games found')).toBeInTheDocument();
  });

  it('renders list of games', () => {
    const games: Game[] = [
      {
        id: '1',
        gameId: 101,
        gameState: 'completed',
        creatorName: 'Creator',
        createdAt: '',
        updatedAt: '',
        datetime: new Date().toISOString(),
      },
    ];

    mockedUseGames.mockReturnValue({ games, loading: false, error: null });

    render(<GameList />);

    expect(screen.getByTestId('game-card')).toHaveTextContent('Game 101');
  });
});
