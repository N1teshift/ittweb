import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PlayerComparison } from '../PlayerComparison';

const mockUseRouter = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => mockUseRouter(),
}));

describe('PlayerComparison', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    global.fetch = jest.fn();
    mockUseRouter.mockReturnValue({
      query: {},
      push: jest.fn(),
    });
  });

  it('shows comparison form when no names provided', () => {
    render(<PlayerComparison pageNamespaces={[]} />);

    expect(screen.getByLabelText('Player Names (comma-separated)')).toBeInTheDocument();
  });

  it('shows error when comparison fetch fails', async () => {
    mockUseRouter.mockReturnValue({ query: { names: 'Alice,Bob' }, push: jest.fn() });
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false } as Response);

    render(<PlayerComparison pageNamespaces={[]} />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to load comparison/)).toBeInTheDocument();
    });
  });

  it('renders comparison cards when data is loaded', async () => {
    mockUseRouter.mockReturnValue({ query: { names: 'Alice,Bob' }, push: jest.fn() });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: {
          players: [
            {
              id: 'alice',
              name: 'Alice',
              categories: { duel: { wins: 1, losses: 0, draws: 0, score: 1200, games: 1 } },
              totalGames: 5,
              createdAt: '',
              updatedAt: '',
            },
            {
              id: 'bob',
              name: 'Bob',
              categories: { duel: { wins: 0, losses: 1, draws: 0, score: 1100, games: 1 } },
              totalGames: 3,
              createdAt: '',
              updatedAt: '',
            },
          ],
          headToHead: {},
          eloComparison: [],
        },
      }),
    } as Response);

    render(<PlayerComparison pageNamespaces={[]} />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });
});
