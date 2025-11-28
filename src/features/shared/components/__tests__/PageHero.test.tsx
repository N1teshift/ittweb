import React from 'react';
import { render, screen } from '@testing-library/react';
import PageHero from '../PageHero';

describe('PageHero', () => {
  it('renders title and description', () => {
    render(<PageHero title="Test Title" description="Test description" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('omits description when not provided', () => {
    render(<PageHero title="Only Title" />);

    expect(screen.getByText('Only Title')).toBeInTheDocument();
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });
});
