import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameDetail } from '../GameDetail';
import type { GameWithPlayers } from '../../types';

const completedGame: GameWithPlayers = {
  id: '1',
  gameId: 100,
  gameState: 'completed',
  creatorName: 'Creator',
  createdAt: '',
  updatedAt: '',
  datetime: '2024-01-01T12:00:00Z',
  duration: 900,
  map: 'maps/test.w3x',
  category: '2v2',
  ownername: 'Owner',
  verified: true,
  players: [
    { id: 'p1', gameId: '1', name: 'Winner', pid: 1, flag: 'winner', elochange: 10, createdAt: '' },
    { id: 'p2', gameId: '1', name: 'Loser', pid: 2, flag: 'loser', elochange: -5, createdAt: '' },
    { id: 'p3', gameId: '1', name: 'Drawer', pid: 3, flag: 'drawer', elochange: 0, createdAt: '' },
  ],
};

describe('GameDetail', () => {
  it('renders completed game details and player sections', () => {
    render(<GameDetail game={completedGame} />);

    expect(screen.getByText('Game #100')).toBeInTheDocument();
    expect(screen.getByText(/test\.w3x/)).toBeInTheDocument();
    expect(screen.getByText('2v2')).toBeInTheDocument();
    expect(screen.getByText('Winners')).toBeInTheDocument();
    expect(screen.getByText('Losers')).toBeInTheDocument();
    expect(screen.getByText('Draw')).toBeInTheDocument();
  });

  it('shows action buttons for scheduled games with permissions', () => {
    const scheduledGame: GameWithPlayers = {
      ...completedGame,
      gameState: 'scheduled',
      scheduledDateTime: '2024-02-01T10:00:00Z',
      timezone: 'UTC',
      participants: [{ discordId: '1', name: 'Player', joinedAt: 'now' }],
      players: [],
    };

    render(
      <GameDetail
        game={scheduledGame}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onLeave={jest.fn()}
        userIsAdmin
        userIsParticipant
      />
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Leave')).toBeInTheDocument();
  });
});
