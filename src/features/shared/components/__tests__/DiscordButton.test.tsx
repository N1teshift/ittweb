import React from 'react';
import { render, screen } from '@testing-library/react';
import DiscordButton from '../DiscordButton';

describe('DiscordButton', () => {
  it('renders discord link with defaults', () => {
    render(<DiscordButton />);

    const link = screen.getByRole('link', { name: 'Join Discord' });
    expect(link).toHaveAttribute('href', 'https://discord.com/invite/Rh9JdKs');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('allows custom label', () => {
    render(<DiscordButton>Open Discord</DiscordButton>);

    expect(screen.getByRole('link', { name: 'Open Discord' })).toBeInTheDocument();
  });
});
