import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PlayersPage } from '../PlayersPage';

const players = [
  {
    id: 'alice',
    name: 'Alice',
    categories: { duel: { wins: 1, losses: 0, draws: 0, score: 1200, games: 1 } },
    totalGames: 1,
    lastPlayed: '2024-01-01T00:00:00Z',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'bob',
    name: 'Bob',
    categories: {},
    totalGames: 2,
    createdAt: '',
    updatedAt: '',
  },
];

describe('PlayersPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: players }),
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders players after successful fetch', async () => {
    render(<PlayersPage pageNamespaces={[]} />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('filters players using search input', async () => {
    render(<PlayersPage pageNamespaces={[]} />);

    await waitFor(() => screen.getByText('Alice'));

    fireEvent.change(screen.getByPlaceholderText('Search players...'), {
      target: { value: 'bob' },
    });

    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false } as Response);

    render(<PlayersPage pageNamespaces={[]} />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to load players/)).toBeInTheDocument();
    });
  });
});
