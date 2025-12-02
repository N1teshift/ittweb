import { logError } from '@/features/infrastructure/logging';

/**
 * Accessibility testing utilities
 * These helpers assist in testing accessibility features across components
 */

/**
 * Get all interactive elements that should be keyboard accessible
 */
export function getInteractiveElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'button',
    'a[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]',
    '[role="link"]',
    '[role="menuitem"]',
    '[role="option"]',
    '[role="tab"]',
    '[role="radio"]',
    '[role="checkbox"]',
  ];

  const elementSet = new Set<HTMLElement>();
  selectors.forEach((selector) => {
    const found = Array.from(container.querySelectorAll<HTMLElement>(selector));
    found.forEach((el) => elementSet.add(el));
  });

  return Array.from(elementSet);
}

/**
 * Check if an element is keyboard focusable
 */
export function isKeyboardFocusable(element: HTMLElement): boolean {
  // Check if element has tabindex
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex === '-1') {
    return false;
  }
  if (tabIndex !== null) {
    return true;
  }

  // Check if element is naturally focusable
  const tagName = element.tagName.toLowerCase();
  const naturallyFocusable = [
    'a',
    'button',
    'input',
    'select',
    'textarea',
    'iframe',
    'object',
    'embed',
  ];

  if (naturallyFocusable.includes(tagName)) {
    // Links must have href
    if (tagName === 'a') {
      return element.hasAttribute('href');
    }
    return true;
  }

  // Check if element has interactive role
  const role = element.getAttribute('role');
  const interactiveRoles = [
    'button',
    'link',
    'menuitem',
    'option',
    'tab',
    'radio',
    'checkbox',
    'switch',
    'textbox',
    'combobox',
  ];
  if (role && interactiveRoles.includes(role)) {
    return true;
  }

  return false;
}

/**
 * Get all elements with ARIA labels
 */
export function getElementsWithAriaLabels(container: HTMLElement): {
  element: HTMLElement;
  label: string | null;
  labelledBy: string | null;
}[] {
  const elements = Array.from(container.querySelectorAll<HTMLElement>('*'));
  return elements
    .map((el) => {
      const label = el.getAttribute('aria-label');
      const labelledBy = el.getAttribute('aria-labelledby');
      if (label || labelledBy) {
        return { element: el, label, labelledBy };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

/**
 * Check if an element has proper ARIA labeling
 */
export function hasProperAriaLabel(element: HTMLElement): boolean {
  // Check if element has aria-label
  if (element.getAttribute('aria-label')) {
    return true;
  }

  // Check if element has aria-labelledby pointing to valid element
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = element.ownerDocument.getElementById(labelledBy);
    if (labelElement && labelElement.textContent) {
      return true;
    }
  }

  // Check if element has associated label (for form inputs)
  const id = element.getAttribute('id');
  if (id) {
    const label = element.ownerDocument.querySelector(`label[for="${id}"]`);
    if (label && label.textContent) {
      return true;
    }
  }

  // Check if element is inside a label
  const parentLabel = element.closest('label');
  if (parentLabel && parentLabel.textContent) {
    return true;
  }

  // Some elements don't need explicit labels (e.g., buttons with text content)
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'button' && element.textContent?.trim()) {
    return true;
  }

  return false;
}

/**
 * Get computed color contrast ratio between two colors
 * Returns ratio (1.0 to 21.0, where 4.5+ is WCAG AA for normal text)
 */
export function getContrastRatio(
  foreground: string,
  background: string
): number {
  try {
    // Convert hex/rgb to RGB values
    const fg = parseColor(foreground);
    const bg = parseColor(background);

    // Calculate relative luminance
    const fgLuminance = getRelativeLuminance(fg);
    const bgLuminance = getRelativeLuminance(bg);

    // Calculate contrast ratio
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    const ratio = (lighter + 0.05) / (darker + 0.05);

    return ratio;
  } catch (error) {
    logError(error as Error, 'Failed to calculate color contrast', {
      component: 'accessibilityHelpers',
      operation: 'getContrastRatio',
      foreground,
      background,
    });
    return 0;
  }
}

/**
 * Parse color string to RGB values
 */
function parseColor(color: string): { r: number; g: number; b: number } {
  // Remove whitespace
  color = color.trim();

  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  }

  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  throw new Error(`Unsupported color format: ${color}`);
}

/**
 * Calculate relative luminance (WCAG formula)
 */
function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Check if contrast ratio meets WCAG standards
 * AA: 4.5:1 for normal text, 3:1 for large text
 * AAA: 7:1 for normal text, 4.5:1 for large text
 */
export function meetsWCAGContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  if (isLargeText) {
    return level === 'AA' ? ratio >= 3 : ratio >= 4.5;
  }
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Get all focusable elements in tab order
 */
export function getFocusableElementsInOrder(container: HTMLElement): HTMLElement[] {
  const elements = getInteractiveElements(container);
  
  // Sort by tabindex and DOM order
  return elements
    .filter(isKeyboardFocusable)
    .sort((a, b) => {
      const aTabIndex = parseInt(a.getAttribute('tabindex') || '0', 10);
      const bTabIndex = parseInt(b.getAttribute('tabindex') || '0', 10);
      
      if (aTabIndex !== bTabIndex) {
        return aTabIndex - bTabIndex;
      }
      
      // Same tabindex, maintain DOM order
      const position = a.compareDocumentPosition(b);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1;
      }
      if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1;
      }
      return 0;
    });
}

/**
 * Get screen reader text content (includes aria-label, aria-labelledby, text content)
 */
export function getScreenReaderText(element: HTMLElement): string {
  const parts: string[] = [];

  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    parts.push(ariaLabel);
  }

  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = element.ownerDocument.getElementById(labelledBy);
    if (labelElement) {
      parts.push(labelElement.textContent || '');
    }
  }

  // Check text content (if no aria-label)
  if (!ariaLabel && !labelledBy) {
    const text = element.textContent?.trim();
    if (text) {
      parts.push(text);
    }
  }

  return parts.join(' ').trim();
}


