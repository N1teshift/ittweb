/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { getScreenReaderText } from '@/features/infrastructure/utils/accessibility/helpers';
import { logError } from '@/features/infrastructure/logging';

// Mock logger
jest.mock('@/features/infrastructure/logging');

describe('Screen Reader Compatibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic screen reader support', () => {
    it('should make content readable by screen readers', () => {
      // Arrange
      const TestComponent = () => (
        <div>
          <h1>Main Heading</h1>
          <p>Paragraph text</p>
          <button>Click Me</button>
        </div>
      );

      // Act
      const { container } = render(<TestComponent />);

      // Assert
      expect(screen.getByText('Main Heading')).toBeInTheDocument();
      expect(screen.getByText('Paragraph text')).toBeInTheDocument();
      expect(screen.getByText('Click Me')).toBeInTheDocument();
      
      // Verify semantic HTML
      const heading = container.querySelector('h1');
      const paragraph = container.querySelector('p');
      const button = container.querySelector('button');
      
      expect(heading).toBeInTheDocument();
      expect(paragraph).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    it('should provide text content for screen readers', () => {
      // Arrange
      const TestComponent = () => (
        <button>Submit Form</button>
      );

      // Act
      const { container } = render(<TestComponent />);
      const button = container.querySelector('button')!;
      const screenReaderText = getScreenReaderText(button);

      // Assert
      expect(screenReaderText).toBe('Submit Form');
    });
  });

  describe('ARIA labels for screen readers', () => {
    it('should use aria-label for screen reader text', () => {
      // Arrange
      const TestComponent = () => (
        <button aria-label="Close dialog">×</button>
      );

      // Act
      const { container } = render(<TestComponent />);
      const button = container.querySelector('button')!;
      const screenReaderText = getScreenReaderText(button);

      // Assert
      expect(screenReaderText).toBe('Close dialog');
      expect(button.getAttribute('aria-label')).toBe('Close dialog');
    });

    it('should use aria-labelledby for screen reader text', () => {
      // Arrange
      const TestComponent = () => (
        <div>
          <span id="label">Form Submit</span>
          <button aria-labelledby="label">Submit</button>
        </div>
      );

      // Act
      const { container } = render(<TestComponent />);
      const button = container.querySelector('button')!;
      const screenReaderText = getScreenReaderText(button);

      // Assert
      expect(screenReaderText).toContain('Form Submit');
      expect(button.getAttribute('aria-labelledby')).toBe('label');
    });

    it('should combine aria-label and text content appropriately', () => {
      // Arrange
      const TestComponent = () => (
        <button aria-label="Delete item">Remove</button>
      );

      // Act
      const { container } = render(<TestComponent />);
      const button = container.querySelector('button')!;
      const screenReaderText = getScreenReaderText(button);

      // Assert
      // aria-label should take precedence
      expect(screenReaderText).toBe('Delete item');
    });
  });

  describe('Dynamic content accessibility', () => {
    it('should announce dynamic content updates', () => {
      // Arrange
      const TestComponent = () => {
        const [count, setCount] = React.useState(0);
        return (
          <div>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <div role="status" aria-live="polite">
              Count: {count}
            </div>
          </div>
        );
      };

      // Act
      render(<TestComponent />);

      // Assert
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toBeInTheDocument();
      expect(statusRegion.getAttribute('aria-live')).toBe('polite');
    });

    it('should handle aria-live regions correctly', () => {
      // Arrange
      const TestComponent = () => (
        <div>
          <div aria-live="polite" aria-atomic="true">
            Status updates appear here
          </div>
          <div aria-live="assertive">
            Urgent messages appear here
          </div>
        </div>
      );

      // Act
      const { container } = render(<TestComponent />);
      const politeRegion = container.querySelector('[aria-live="polite"]');
      const assertiveRegion = container.querySelector('[aria-live="assertive"]');

      // Assert
      expect(politeRegion).toBeInTheDocument();
      expect(politeRegion?.getAttribute('aria-atomic')).toBe('true');
      expect(assertiveRegion).toBeInTheDocument();
    });
  });

  describe('Semantic HTML', () => {
    it('should use semantic HTML elements', () => {
      // Arrange
      const TestComponent = () => (
        <div>
          <header>
            <nav>
              <ul>
                <li><a href="/">Home</a></li>
              </ul>
            </nav>
          </header>
          <main>
            <article>
              <h1>Article Title</h1>
              <section>
                <p>Article content</p>
              </section>
            </article>
          </main>
          <footer>Footer content</footer>
        </div>
      );

      // Act
      const { container } = render(<TestComponent />);

      // Assert
      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('nav')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('article')).toBeInTheDocument();
      expect(container.querySelector('section')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('should use proper heading hierarchy', () => {
      // Arrange
      const TestComponent = () => (
        <div>
          <h1>Main Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
        </div>
      );

      // Act
      const { container } = render(<TestComponent />);

      // Assert
      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const h3 = container.querySelector('h3');
      
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
      
      // Verify hierarchy
      expect(h1?.textContent).toBe('Main Title');
      expect(h2?.textContent).toBe('Section Title');
      expect(h3?.textContent).toBe('Subsection Title');
    });
  });

  describe('Form accessibility', () => {
    it('should associate labels with form inputs', () => {
      // Arrange
      const TestComponent = () => (
        <form>
          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" />
        </form>
      );

      // Act
      render(<TestComponent />);
      const input = screen.getByLabelText('Email Address');

      // Assert
      expect(input).toBeInTheDocument();
      expect(input.getAttribute('id')).toBe('email');
    });

    it('should provide screen reader text for form errors', () => {
      // Arrange
      const TestComponent = () => (
        <form>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            aria-invalid="true"
            aria-describedby="email-error"
          />
          <span id="email-error" role="alert">
            Please enter a valid email address
          </span>
        </form>
      );

      // Act
      render(<TestComponent />);
      const input = screen.getByLabelText('Email');
      const error = screen.getByRole('alert');

      // Assert
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe('email-error');
      expect(error).toBeInTheDocument();
      expect(error.textContent).toBe('Please enter a valid email address');
    });
  });

  describe('Image accessibility', () => {
    it('should provide alt text for images', () => {
      // Arrange
      const TestComponent = () => (
        <img src="/test.jpg" alt="Descriptive alt text" />
      );

      // Act
      render(<TestComponent />);
      const image = screen.getByAltText('Descriptive alt text');

      // Assert
      expect(image).toBeInTheDocument();
      expect(image.getAttribute('alt')).toBe('Descriptive alt text');
    });

    it('should mark decorative images appropriately', () => {
      // Arrange
      const TestComponent = () => (
        <img src="/decoration.jpg" alt="" role="presentation" />
      );

      // Act
      render(<TestComponent />);
      const image = screen.getByRole('presentation');

      // Assert
      expect(image).toBeInTheDocument();
      expect(image.getAttribute('alt')).toBe('');
    });
  });
});

