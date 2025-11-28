import React from 'react';
import { render, screen } from '@testing-library/react';
import GitHubButton from '../GitHubButton';

describe('GitHubButton', () => {
  it('renders GitHub link with default label', () => {
    render(<GitHubButton href="https://github.com/example" />);

    const link = screen.getByRole('link', { name: 'GitHub link' });
    expect(link).toHaveAttribute('href', 'https://github.com/example');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('supports custom label and aria label', () => {
    render(
      <GitHubButton href="https://github.com/example" ariaLabel="Example Repo">
        View Repo
      </GitHubButton>
    );

    expect(screen.getByRole('link', { name: 'Example Repo' })).toHaveTextContent('View Repo');
  });
});
