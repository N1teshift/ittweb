import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

const mockedUseSession = jest.requireMock('next-auth/react').useSession as jest.Mock;

describe('Header', () => {
  beforeEach(() => {
    mockedUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
  });

  it('renders navigation links', () => {
    render(<Header />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Guides')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('shows sign in button when not authenticated', () => {
    render(<Header />);

    expect(screen.getByText('Sign in with Discord')).toBeInTheDocument();
  });

  it('shows user menu when authenticated', () => {
    mockedUseSession.mockReturnValue({
      data: { user: { name: 'Jane Doe', image: 'avatar.png' } },
      status: 'authenticated',
    });

    render(<Header />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('toggles mobile menu items', () => {
    const { container } = render(<Header />);

    const toggle = container.querySelector('div[class*="md:hidden"] button') as HTMLButtonElement;
    fireEvent.click(toggle);

    expect(screen.getByText('Create Game')).toBeInTheDocument();
  });
});
