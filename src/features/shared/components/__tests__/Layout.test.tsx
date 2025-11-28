import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../Layout';

jest.mock('../Header', () => () => <div data-testid="header-mock">Header</div>);
jest.mock('../Footer', () => () => <div data-testid="footer-mock">Footer</div>);
jest.mock('../DataCollectionNotice', () => () => <div data-testid="notice-mock">Notice</div>);

describe('Layout', () => {
  it('wraps children with Header, Footer, and DataCollectionNotice', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByTestId('footer-mock')).toBeInTheDocument();
    expect(screen.getByTestId('notice-mock')).toBeInTheDocument();
  });
});
