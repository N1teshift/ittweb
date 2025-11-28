import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameCard } from '../GameCard';
import type { Game } from '../../types';

const baseGame: Game = {
  id: '1',
  gameId: 10,
  gameState: 'completed',
  creatorName: 'Creator',
  createdAt: '',
  updatedAt: '',
  datetime: new Date('2024-01-01T12:00:00Z').toISOString(),
};

describe('GameCard', () => {
  it('renders game information', () => {
    render(<GameCard game={baseGame} />);

    expect(screen.getByText('Game #10')).toBeInTheDocument();
  });

  it('renders category and map', () => {
    render(<GameCard game={{ ...baseGame, category: '2v2', map: 'maps/test.w3x' }} />);

    expect(screen.getByText('2v2')).toBeInTheDocument();
    expect(screen.getByText(/test\.w3x/)).toBeInTheDocument();
  });

  it('shows duration when provided', () => {
    render(<GameCard game={{ ...baseGame, duration: 3600 }} />);

    expect(screen.getByText(/Duration/)).toBeInTheDocument();
  });
});
