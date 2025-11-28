import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  it('renders footer content and link', () => {
    render(<Footer />);

    expect(screen.getByText(/Island Troll Tribes/)).toBeInTheDocument();
    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });
});
