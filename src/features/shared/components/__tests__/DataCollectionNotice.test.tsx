import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DataCollectionNotice from '../DataCollectionNotice';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockedUseSession = jest.requireMock('next-auth/react').useSession as jest.Mock;

describe('DataCollectionNotice', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockedUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    (global.fetch as jest.Mock | undefined)?.mockReset?.();
  });

  it('does not render when user is not authenticated', () => {
    const { container } = render(<DataCollectionNotice />);
    expect(container.firstChild).toBeNull();
  });

  it('renders notice when user has not accepted', async () => {
    mockedUseSession.mockReturnValue({
      data: { discordId: '123' },
      status: 'authenticated',
    });

    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ accepted: false }) });

    render(<DataCollectionNotice />);

    await waitFor(() => {
      expect(screen.getByText(/We collect information/)).toBeInTheDocument();
    });
  });

  it('hides after accepting', async () => {
    mockedUseSession.mockReturnValue({
      data: { discordId: '123' },
      status: 'authenticated',
    });

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ accepted: false }) })
      .mockResolvedValueOnce({ ok: true });

    render(<DataCollectionNotice />);

    await waitFor(() => screen.getByText(/We collect information/));

    fireEvent.click(screen.getByText('Got it'));

    await waitFor(() => {
      expect(screen.queryByText(/We collect information/)).not.toBeInTheDocument();
    });
  });

  it('hides after dismissing for the session', async () => {
    mockedUseSession.mockReturnValue({
      data: { discordId: '123' },
      status: 'authenticated',
    });

    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ accepted: false }) });

    render(<DataCollectionNotice />);

    await waitFor(() => screen.getByText(/We collect information/));

    fireEvent.click(screen.getByLabelText('Dismiss'));

    await waitFor(() => {
      expect(screen.queryByText(/We collect information/)).not.toBeInTheDocument();
    });
    expect(sessionStorage.getItem('dataCollectionNoticeDismissed')).toBe('true');
  });
});
