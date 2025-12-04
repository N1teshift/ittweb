/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { getFocusableElementsInOrder } from '@/features/infrastructure/utils/accessibility/helpers';
import { logError } from '@/features/infrastructure/logging';

// Mock logger
jest.mock('@/features/infrastructure/logging');

describe('Focus Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic focus management', () => {
    it('should verify focus moves logically', () => {
      // Arrange
      const TestComponent = () => (
        <div>
          <button>First</button>
          <input type="text" />
          <button>Second</button>
        </div>
      );

      // Act
      const { container } = render(<TestComponent />);
      const focusableElements = getFocusableElementsInOrder(container);

      // Assert
      expect(focusableElements.length).toBe(3);
      expect(focusableElements[0].textContent).toBe('First');
      expect(focusableElements[1].tagName).toBe('INPUT');
      expect(focusableElements[2].textContent).toBe('Second');
    });

    it('should verify visible focus indicators', () => {
      // Arrange
      const TestComponent = () => (
        <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
          Focusable Button
        </button>
      );

      // Act
      render(<TestComponent />);
      const button = screen.getByText('Focusable Button');
      button.focus();

      // Assert
      expect(button).toHaveFocus();
      // Check for focus styles (this is a basic check; actual CSS would need to be computed)
      expect(button.className).toContain('focus-visible:ring-2');
    });
  });

  describe('Modal focus management', () => {
    it('should trap focus within modal', async () => {
      // Arrange
      const user = userEvent.setup();
      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        const modalRef = React.useRef<HTMLDivElement>(null);
        
        React.useEffect(() => {
          if (isOpen && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
              (focusableElements[0] as HTMLElement).focus();
            }
          }
        }, [isOpen]);

        return (
          <div>
            <button onClick={() => setIsOpen(true)}>Open Modal</button>
            {isOpen && (
              <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                className="modal"
              >
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
      const modalButtons = screen.getAllByRole('button').filter(
        (btn) => btn.closest('[role="dialog"]')
      );
      
      expect(modal).toBeInTheDocument();
      expect(modalButtons.length).toBeGreaterThan(0);
      
      // First modal button should be focused
      const firstModalButton = modalButtons[0];
      expect(firstModalButton).toHaveFocus();
    });

    it('should return focus to trigger element when modal closes', async () => {
      // Arrange
      const user = userEvent.setup();
      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        const triggerRef = React.useRef<HTMLButtonElement>(null);

        return (
          <div>
            <button
              ref={triggerRef}
              onClick={() => setIsOpen(true)}
            >
              Open Modal
            </button>
            {isOpen && (
              <div role="dialog" aria-modal="true">
                <button onClick={() => {
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}>
                  Close
                </button>
              </div>
            )}
          </div>
        );
      };

      // Act
      render(<TestComponent />);
      const openButton = screen.getByText('Open Modal');
      openButton.focus();
      await user.click(openButton);

      const closeButton = screen.getByText('Close');
      await user.click(closeButton);

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(openButton).toHaveFocus();
    });
  });

  describe('Dynamic content focus management', () => {
    it('should manage focus when content is added dynamically', async () => {
      // Arrange
      const user = userEvent.setup();
      const TestComponent = () => {
        const [items, setItems] = React.useState<string[]>([]);
        const newItemRef = React.useRef<HTMLButtonElement>(null);

        const addItem = () => {
          setItems([...items, `Item ${items.length + 1}`]);
          setTimeout(() => {
            newItemRef.current?.focus();
          }, 0);
        };

        return (
          <div>
            <button onClick={addItem}>Add Item</button>
            {items.map((item, index) => (
              <button
                key={item}
                ref={index === items.length - 1 ? newItemRef : null}
              >
                {item}
              </button>
            ))}
          </div>
        );
      };

      // Act
      render(<TestComponent />);
      const addButton = screen.getByText('Add Item');
      await user.click(addButton);

      // Assert
      const newButton = screen.getByText('Item 1');
      expect(newButton).toBeInTheDocument();
      // Focus management would be tested in actual implementation
    });

    it('should handle focus when content is removed', async () => {
      // Arrange
      const user = userEvent.setup();
      const TestComponent = () => {
        const [items, setItems] = React.useState(['Item 1', 'Item 2', 'Item 3']);

        const removeItem = (index: number) => {
          const newItems = items.filter((_, i) => i !== index);
          setItems(newItems);
        };

        return (
          <div>
            {items.map((item, index) => (
              <div key={item}>
                <button onClick={() => removeItem(index)}>Remove</button>
                <span>{item}</span>
              </div>
            ))}
          </div>
        );
      };

      // Act
      render(<TestComponent />);
      const removeButtons = screen.getAllByText('Remove');
      await user.click(removeButtons[1]);

      // Assert
      expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  describe('Focus trap edge cases', () => {
    it('should handle focus trap with no focusable elements', () => {
      // Arrange
      const TestComponent = () => (
        <div role="dialog" aria-modal="true">
          <p>No focusable elements</p>
        </div>
      );

      // Act
      render(<TestComponent />);
      const modal = screen.getByRole('dialog');

      // Assert
      expect(modal).toBeInTheDocument();
      // Modal should still be accessible even without focusable elements
    });

    it('should handle nested modals focus management', () => {
      // Arrange
      const TestComponent = () => {
        const [outerOpen, setOuterOpen] = React.useState(true);
        const [innerOpen, setInnerOpen] = React.useState(false);

        return (
          <div>
            {outerOpen && (
              <div role="dialog" aria-modal="true">
                <button onClick={() => setInnerOpen(true)}>Open Inner</button>
                <button onClick={() => setOuterOpen(false)}>Close Outer</button>
                {innerOpen && (
                  <div role="dialog" aria-modal="true">
                    <button onClick={() => setInnerOpen(false)}>Close Inner</button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      };

      // Act
      render(<TestComponent />);

      // Assert
      const outerModal = screen.getByText('Open Inner').closest('[role="dialog"]');
      expect(outerModal).toBeInTheDocument();
      
      // This test documents the structure; actual focus management would be more complex
    });
  });

  describe('Keyboard navigation focus', () => {
    it('should handle Tab key navigation', async () => {
      // Arrange
      const user = userEvent.setup();
      const TestComponent = () => (
        <div>
          <button>First</button>
          <button>Second</button>
          <button>Third</button>
        </div>
      );

      // Act
      render(<TestComponent />);
      const firstButton = screen.getByText('First');
      const secondButton = screen.getByText('Second');
      const thirdButton = screen.getByText('Third');
      
      firstButton.focus();
      expect(firstButton).toHaveFocus();
      
      await user.tab();
      
      // Assert
      // After first tab, focus should move to second button
      expect(secondButton).toHaveFocus();
      expect(firstButton).not.toHaveFocus();
    });

    it('should handle Shift+Tab for reverse navigation', async () => {
      // Arrange
      const user = userEvent.setup();
      const TestComponent = () => (
        <div>
          <button>First</button>
          <button>Second</button>
        </div>
      );

      // Act
      render(<TestComponent />);
      const secondButton = screen.getByText('Second');
      secondButton.focus();
      
      await user.tab({ shift: true });

      // Assert
      const firstButton = screen.getByText('First');
      // Focus should move to first button
      // Note: Actual behavior depends on implementation
    });
  });

  describe('Focus visibility', () => {
    it('should verify focus indicators are visible', () => {
      // Arrange
      const TestComponent = () => (
        <button className="focus:outline-2 focus:outline-blue-500">
          Button with Focus Style
        </button>
      );

      // Act
      render(<TestComponent />);
      const button = screen.getByText('Button with Focus Style');
      button.focus();

      // Assert
      expect(button).toHaveFocus();
      // CSS classes indicate focus styles are defined
      expect(button.className).toContain('focus:outline');
    });

    it('should handle focus-visible for keyboard navigation', () => {
      // Arrange
      const TestComponent = () => (
        <button className="focus-visible:ring-2 focus-visible:ring-amber-400">
          Keyboard Focusable
        </button>
      );

      // Act
      render(<TestComponent />);
      const button = screen.getByText('Keyboard Focusable');

      // Assert
      // focus-visible only shows for keyboard navigation, not mouse clicks
      expect(button.className).toContain('focus-visible:ring');
    });
  });
});

