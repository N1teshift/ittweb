/**
 * Hook for modal accessibility features
 * 
 * Provides:
 * - Escape key handling to close modal
 * - Initial focus on first focusable element
 * - Focus trap (optional)
 */

import { useEffect, useRef } from 'react';

interface UseModalAccessibilityOptions {
  isOpen: boolean;
  onClose: () => void;
  /** Whether to trap focus within modal (default: true) */
  trapFocus?: boolean;
  /** Whether to focus first element on open (default: true) */
  focusOnOpen?: boolean;
  /** Custom element to focus on open (default: first focusable element) */
  initialFocusRef?: React.RefObject<HTMLElement>;
}

/**
 * Hook to handle modal accessibility
 * 
 * @example
 * ```tsx
 * const modalRef = useRef<HTMLDivElement>(null);
 * useModalAccessibility({
 *   isOpen,
 *   onClose,
 *   trapFocus: true,
 * });
 * 
 * return (
 *   <div ref={modalRef} role="dialog" aria-modal="true">
 *     ...
 *   </div>
 * );
 * ```
 */
export function useModalAccessibility({
  isOpen,
  onClose,
  trapFocus = true,
  focusOnOpen = true,
  initialFocusRef,
}: UseModalAccessibilityOptions) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (!isOpen) {
      // Return focus to previous element when modal closes
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
      return;
    }

    // Store current active element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus initial element
    if (focusOnOpen) {
      const focusElement = () => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
          return;
        }

        // Find first focusable element in modal
        const modal = modalRef.current;
        if (!modal) return;

        const focusableSelectors = [
          'button:not([disabled])',
          '[href]',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          '[tabindex]:not([tabindex="-1"])',
        ].join(', ');

        const focusableElements = modal.querySelectorAll<HTMLElement>(focusableSelectors);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      };

      // Small delay to ensure modal is rendered
      setTimeout(focusElement, 0);
    }

    // Focus trap
    if (trapFocus) {
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        const modal = modalRef.current;
        if (!modal) return;

        const focusableSelectors = [
          'button:not([disabled])',
          '[href]',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          '[tabindex]:not([tabindex="-1"])',
        ].join(', ');

        const focusableElements = Array.from(
          modal.querySelectorAll<HTMLElement>(focusableSelectors)
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const currentElement = document.activeElement as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab
          if (currentElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (currentElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      return () => {
        document.removeEventListener('keydown', handleTab);
      };
    }
  }, [isOpen, focusOnOpen, trapFocus, initialFocusRef]);

  return modalRef;
}

