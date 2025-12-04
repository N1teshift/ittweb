/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  getInteractiveElements,
  isKeyboardFocusable,
  getFocusableElementsInOrder,
} from '@/features/infrastructure/utils/accessibility/helpers';
import { logError } from '@/features/infrastructure/logging';

// Mock logger
jest.mock('@/features/infrastructure/logging');

describe('Keyboard Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic keyboard accessibility', () => {
    it('should make all interactive elements keyboard accessible', () => {
      // Arrange
      const TestComponent = () => (
        <div>
          <button>Button 1</button>
          <a href="/test">Link 1</a>
          <input type="text" />
          <button>Button 2</button>
        </div>
      );

      // Act
      const { container } = render(<TestComponent />);

      // Assert
      const interactiveElements = getInteractiveElements(container);
      expect(interactiveElements.length).toBeGreaterThan(0);

      interactiveElements.forEach((element: HTMLElement) => {
        expect(isKeyboardFocusable(element)).toBe(true);
      });
    });

    it('should handle complex interactions with keyboard', () => {
      // Arrange
      const handleClick = jest.fn();
      const TestComponent = () => (
        <div>
          <button onClick={handleClick}>Action Button</button>
          <div role="button" tabIndex={0} onClick={handleClick}>
            Custom Button
          </div>
        </div>
      );

      // Act
      render(<TestComponent />);
      const button = screen.getByText('Action Button');
      const customButton = screen.getByText('Custom Button');

      // Assert
      expect(isKeyboardFocusable(button)).toBe(true);
      expect(isKeyboardFocusable(customButton)).toBe(true);
    });

    it('should maintain logical tab order', async () => {
      // Arrange
      const user = userEvent.setup();
      const TestComponent = () => (
        <div>
          <button>First</button>
          <input type="text" />
          <button>Second</button>
          <a href="/test">Link</a>
        </div>
      );

      // Act
      const { container } = render(<TestComponent />);
      const focusableElements = getFocusableElementsInOrder(container);

      // Assert
      expect(focusableElements.length).toBe(4);
      
      // Verify tab order
      const firstButton = screen.getByText('First');
      expect(focusableElements[0]).toBe(firstButton);
    });

    it('should handle tabindex ordering correctly', () => {
      // Arrange
      const TestComponent = () => (
        <div>
          <button tabIndex={3}>Third</button>
          <button tabIndex={1}>First</button>
          <button tabIndex={2}>Second</button>
        </div>
      );

      // Act
      const { container } = render(<TestComponent />);
      const focusableElements = getFocusableElementsInOrder(container);

      // Assert
      // Elements should be sorted by tabindex value (1, 2, 3)
      expect(focusableElements.length).toBe(3);
      const tabIndices = focusableElements.map(el => parseInt(el.getAttribute('tabindex') || '0', 10));
      expect(tabIndices).toEqual([1, 2, 3]);
      expect(focusableElements[0].textContent).toBe('First');
      expect(focusableElements[1].textContent).toBe('Second');
      expect(focusableElements[2].textContent).toBe('Third');
    });
  });

  describe('Focus management edge cases', () => {
    it('should handle focus traps in modals', async () => {
      // Arrange
      const user = userEvent.setup();
      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        return (
          <div>
            <button onClick={() => setIsOpen(true)}>Open Modal</button>
            {isOpen && (
              <div role="dialog" aria-modal="true">
                <button>Modal Button 1</button>
                <button>Modal Button 2</button>
                <button onClick={() => setIsOpen(false)}>Close</button>
              </div>
            )}
          </div>
        );
      };

      // Act
      render(<TestComponent />);
      const openButton = screen.getByText('Open Modal');
      await user.click(openButton);

      // Assert
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      
      const modalButtons = screen.getAllByRole('button');
      modalButtons.forEach((button) => {
        if (button.closest('[role="dialog"]')) {
          expect(isKeyboardFocusable(button)).toBe(true);
        }
      });
    });

    it('should handle dynamic content focus management', async () => {
      // Arrange
      const user = userEvent.setup();
      const TestComponent = () => {
        const [items, setItems] = React.useState<string[]>([]);
        return (
          <div>
            <button onClick={() => setItems(['Item 1', 'Item 2'])}>
              Add Items
            </button>
            {items.map((item) => (
              <button key={item}>{item}</button>
            ))}
          </div>
        );
      };

      // Act
      const { container } = render(<TestComponent />);
      const addButton = screen.getByText('Add Items');
      await user.click(addButton);

      // Assert
      const interactiveElements = getInteractiveElements(container);
      expect(interactiveElements.length).toBeGreaterThan(1);
      
      const newButtons = screen.getAllByRole('button');
      newButtons.forEach((button) => {
        expect(isKeyboardFocusable(button)).toBe(true);
      });
    });

    it('should exclude elements with tabindex="-1" from tab order', () => {
      // Arrange
      const TestComponent = () => (
        <div>
          <button>Focusable</button>
          <button tabIndex={-1}>Not Focusable</button>
          <button>Also Focusable</button>
        </div>
      );

      // Act
      const { container } = render(<TestComponent />);
      const focusableElements = getFocusableElementsInOrder(container);

      // Assert
      expect(focusableElements.length).toBe(2);
      expect(focusableElements.every((el) => el.getAttribute('tabindex') !== '-1')).toBe(true);
    });
  });

  describe('Keyboard event handling', () => {
    it('should handle Enter key on buttons', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleClick = jest.fn();
      const TestComponent = () => (
        <button onClick={handleClick}>Click Me</button>
      );

      // Act
      render(<TestComponent />);
      const button = screen.getByText('Click Me');
      button.focus();
      await user.keyboard('{Enter}');

      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle Space key on buttons', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleClick = jest.fn();
      const TestComponent = () => (
        <button onClick={handleClick}>Click Me</button>
      );

      // Act
      render(<TestComponent />);
      const button = screen.getByText('Click Me');
      button.focus();
      await user.keyboard(' ');

      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should handle Escape key to close modals', async () => {
      // Arrange
      const user = userEvent.setup();
      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(true);
        React.useEffect(() => {
          const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
          };
          window.addEventListener('keydown', handleEscape);
          return () => window.removeEventListener('keydown', handleEscape);
        }, []);
        return (
          <div>
            {isOpen && (
              <div role="dialog" aria-modal="true">
                Modal Content
              </div>
            )}
          </div>
        );
      };

      // Act
      render(<TestComponent />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      await user.keyboard('{Escape}');

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

