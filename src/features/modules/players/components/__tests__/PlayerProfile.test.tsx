import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlayerProfile } from '../PlayerProfile';

jest.mock('../../hooks/usePlayerStats', () => ({
  usePlayerStats: jest.fn(),
}));

const mockedUsePlayerStats = jest.requireMock('../../hooks/usePlayerStats').usePlayerStats as jest.Mock;

const player = {
  id: 'alice',
  name: 'Alice',
  categories: { duel: { wins: 1, losses: 0, draws: 0, score: 1200, games: 1 } },
  totalGames: 5,
  lastPlayed: '2024-01-01T00:00:00Z',
  createdAt: '',
  updatedAt: '',
  recentGames: [
    { id: 'g1', gameId: 1, gameState: 'completed', creatorName: 'Alice', createdAt: '', updatedAt: '', datetime: '2024-01-01T00:00:00Z' },
  ],
};

describe('PlayerProfile', () => {
  beforeEach(() => {
    mockedUsePlayerStats.mockReset();
  });

  it('renders loading state', () => {
    mockedUsePlayerStats.mockReturnValue({ player: null, loading: true, error: null });

    const { container } = render(<PlayerProfile name="Alice" />);

    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders error state', () => {
    mockedUsePlayerStats.mockReturnValue({ player: null, loading: false, error: new Error('Not found') });

    render(<PlayerProfile name="Alice" />);

    expect(screen.getByText('Error: Not found')).toBeInTheDocument();
  });

  it('renders player details', () => {
    mockedUsePlayerStats.mockReturnValue({ player, loading: false, error: null });

    render(<PlayerProfile name="Alice" />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Total Games:')).toBeInTheDocument();
    expect(screen.getByText('duel', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Game #1')).toBeInTheDocument();
  });
});
