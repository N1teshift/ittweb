import {
  getInteractiveElements,
  isKeyboardFocusable,
  getElementsWithAriaLabels,
  hasProperAriaLabel,
  getContrastRatio,
  meetsWCAGContrast,
  getFocusableElementsInOrder,
  getScreenReaderText,
} from '../helpers';

// Mock logger
jest.mock('@/features/infrastructure/logging', () => ({
  logError: jest.fn(),
}));

describe('getInteractiveElements', () => {
  it('finds buttons', () => {
    // Arrange
    const container = document.createElement('div');
    const button = document.createElement('button');
    button.textContent = 'Click me';
    container.appendChild(button);

    // Act
    const elements = getInteractiveElements(container);

    // Assert
    expect(elements).toHaveLength(1);
    expect(elements[0]).toBe(button);
  });

  it('finds links with href', () => {
    // Arrange
    const container = document.createElement('div');
    const link = document.createElement('a');
    link.href = '/test';
    link.textContent = 'Link';
    container.appendChild(link);

    // Act
    const elements = getInteractiveElements(container);

    // Assert
    expect(elements).toHaveLength(1);
    expect(elements[0]).toBe(link);
  });

  it('finds form inputs', () => {
    // Arrange
    const container = document.createElement('div');
    const input = document.createElement('input');
    const select = document.createElement('select');
    const textarea = document.createElement('textarea');
    container.appendChild(input);
    container.appendChild(select);
    container.appendChild(textarea);

    // Act
    const elements = getInteractiveElements(container);

    // Assert
    expect(elements).toHaveLength(3);
  });

  it('finds elements with tabindex', () => {
    // Arrange
    const container = document.createElement('div');
    const div = document.createElement('div');
    div.setAttribute('tabindex', '0');
    container.appendChild(div);

    // Act
    const elements = getInteractiveElements(container);

    // Assert
    expect(elements).toHaveLength(1);
    expect(elements[0]).toBe(div);
  });

  it('excludes elements with tabindex="-1"', () => {
    // Arrange
    const container = document.createElement('div');
    const div = document.createElement('div');
    div.setAttribute('tabindex', '-1');
    container.appendChild(div);

    // Act
    const elements = getInteractiveElements(container);

    // Assert
    expect(elements).toHaveLength(0);
  });

  it('finds elements with interactive roles', () => {
    // Arrange
    const container = document.createElement('div');
    const buttonRole = document.createElement('div');
    buttonRole.setAttribute('role', 'button');
    const linkRole = document.createElement('div');
    linkRole.setAttribute('role', 'link');
    container.appendChild(buttonRole);
    container.appendChild(linkRole);

    // Act
    const elements = getInteractiveElements(container);

    // Assert
    expect(elements).toHaveLength(2);
  });

  it('deduplicates elements found by multiple selectors', () => {
    // Arrange
    const container = document.createElement('div');
    const button = document.createElement('button');
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    container.appendChild(button);

    // Act
    const elements = getInteractiveElements(container);

    // Assert
    expect(elements).toHaveLength(1);
  });
});

describe('isKeyboardFocusable', () => {
  it('returns true for buttons', () => {
    // Arrange
    const button = document.createElement('button');

    // Act & Assert
    expect(isKeyboardFocusable(button)).toBe(true);
  });

  it('returns true for links with href', () => {
    // Arrange
    const link = document.createElement('a');
    link.href = '/test';

    // Act & Assert
    expect(isKeyboardFocusable(link)).toBe(true);
  });

  it('returns false for links without href', () => {
    // Arrange
    const link = document.createElement('a');

    // Act & Assert
    expect(isKeyboardFocusable(link)).toBe(false);
  });

  it('returns true for inputs', () => {
    // Arrange
    const input = document.createElement('input');

    // Act & Assert
    expect(isKeyboardFocusable(input)).toBe(true);
  });

  it('returns true for elements with tabindex', () => {
    // Arrange
    const div = document.createElement('div');
    div.setAttribute('tabindex', '0');

    // Act & Assert
    expect(isKeyboardFocusable(div)).toBe(true);
  });

  it('returns false for elements with tabindex="-1"', () => {
    // Arrange
    const div = document.createElement('div');
    div.setAttribute('tabindex', '-1');

    // Act & Assert
    expect(isKeyboardFocusable(div)).toBe(false);
  });

  it('returns true for elements with interactive roles', () => {
    // Arrange
    const div = document.createElement('div');
    div.setAttribute('role', 'button');

    // Act & Assert
    expect(isKeyboardFocusable(div)).toBe(true);
  });

  it('returns false for non-interactive elements', () => {
    // Arrange
    const div = document.createElement('div');

    // Act & Assert
    expect(isKeyboardFocusable(div)).toBe(false);
  });
});

describe('getElementsWithAriaLabels', () => {
  it('finds elements with aria-label', () => {
    // Arrange
    const container = document.createElement('div');
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'Close dialog');
    container.appendChild(button);

    // Act
    const result = getElementsWithAriaLabels(container);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].element).toBe(button);
    expect(result[0].label).toBe('Close dialog');
    expect(result[0].labelledBy).toBeNull();
  });

  it('finds elements with aria-labelledby', () => {
    // Arrange
    const container = document.createElement('div');
    const label = document.createElement('span');
    label.id = 'label-id';
    label.textContent = 'Label text';
    const button = document.createElement('button');
    button.setAttribute('aria-labelledby', 'label-id');
    container.appendChild(label);
    container.appendChild(button);

    // Act
    const result = getElementsWithAriaLabels(container);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].element).toBe(button);
    expect(result[0].label).toBeNull();
    expect(result[0].labelledBy).toBe('label-id');
  });

  it('finds elements with both aria-label and aria-labelledby', () => {
    // Arrange
    const container = document.createElement('div');
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'Label');
    button.setAttribute('aria-labelledby', 'label-id');
    container.appendChild(button);

    // Act
    const result = getElementsWithAriaLabels(container);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('Label');
    expect(result[0].labelledBy).toBe('label-id');
  });

  it('returns empty array when no elements have aria labels', () => {
    // Arrange
    const container = document.createElement('div');
    const div = document.createElement('div');
    container.appendChild(div);

    // Act
    const result = getElementsWithAriaLabels(container);

    // Assert
    expect(result).toHaveLength(0);
  });
});

describe('hasProperAriaLabel', () => {
  it('returns true for element with aria-label', () => {
    // Arrange
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'Close');

    // Act & Assert
    expect(hasProperAriaLabel(button)).toBe(true);
  });

  it('returns true for element with valid aria-labelledby', () => {
    // Arrange
    const container = document.createElement('div');
    document.body.appendChild(container);
    const label = document.createElement('span');
    label.id = 'label-id';
    label.textContent = 'Label text';
    const button = document.createElement('button');
    button.setAttribute('aria-labelledby', 'label-id');
    container.appendChild(label);
    container.appendChild(button);

    // Act & Assert
    expect(hasProperAriaLabel(button)).toBe(true);
    document.body.removeChild(container);
  });

  it('returns true for input with associated label', () => {
    // Arrange
    const container = document.createElement('div');
    document.body.appendChild(container);
    const label = document.createElement('label');
    label.setAttribute('for', 'input-id');
    label.textContent = 'Input label';
    const input = document.createElement('input');
    input.id = 'input-id';
    container.appendChild(label);
    container.appendChild(input);

    // Act & Assert
    expect(hasProperAriaLabel(input)).toBe(true);
    document.body.removeChild(container);
  });

  it('returns true for element inside label', () => {
    // Arrange
    const label = document.createElement('label');
    label.textContent = 'Label text';
    const input = document.createElement('input');
    label.appendChild(input);

    // Act & Assert
    expect(hasProperAriaLabel(input)).toBe(true);
  });

  it('returns true for button with text content', () => {
    // Arrange
    const button = document.createElement('button');
    button.textContent = 'Click me';

    // Act & Assert
    expect(hasProperAriaLabel(button)).toBe(true);
  });

  it('returns false for element without proper labeling', () => {
    // Arrange
    const div = document.createElement('div');

    // Act & Assert
    expect(hasProperAriaLabel(div)).toBe(false);
  });

  it('returns false for aria-labelledby pointing to non-existent element', () => {
    // Arrange
    const button = document.createElement('button');
    button.setAttribute('aria-labelledby', 'non-existent');

    // Act & Assert
    expect(hasProperAriaLabel(button)).toBe(false);
  });
});

describe('getContrastRatio', () => {
  it('calculates contrast ratio for black on white', () => {
    // Arrange & Act
    const ratio = getContrastRatio('#000000', '#FFFFFF');

    // Assert
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('calculates contrast ratio for white on black', () => {
    // Arrange & Act
    const ratio = getContrastRatio('#FFFFFF', '#000000');

    // Assert
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('calculates contrast ratio for gray on white', () => {
    // Arrange & Act
    const ratio = getContrastRatio('#808080', '#FFFFFF');

    // Assert
    expect(ratio).toBeGreaterThan(1);
    expect(ratio).toBeLessThan(21);
  });

  it('handles rgb color format', () => {
    // Arrange & Act
    const ratio = getContrastRatio('rgb(0, 0, 0)', 'rgb(255, 255, 255)');

    // Assert
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('handles rgba color format', () => {
    // Arrange & Act
    const ratio = getContrastRatio('rgba(0, 0, 0, 1)', 'rgba(255, 255, 255, 1)');

    // Assert
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('returns 0 for invalid color format', () => {
    // Arrange & Act
    const ratio = getContrastRatio('invalid', '#FFFFFF');

    // Assert
    expect(ratio).toBe(0);
  });
});

describe('meetsWCAGContrast', () => {
  it('returns true for AA normal text contrast', () => {
    // Arrange & Act
    const meets = meetsWCAGContrast('#000000', '#FFFFFF', 'AA', false);

    // Assert
    expect(meets).toBe(true);
  });

  it('returns true for AA large text contrast', () => {
    // Arrange & Act
    const meets = meetsWCAGContrast('#666666', '#FFFFFF', 'AA', true);

    // Assert
    expect(meets).toBe(true);
  });

  it('returns true for AAA normal text contrast', () => {
    // Arrange & Act
    const meets = meetsWCAGContrast('#000000', '#FFFFFF', 'AAA', false);

    // Assert
    expect(meets).toBe(true);
  });

  it('returns false for insufficient contrast', () => {
    // Arrange & Act
    const meets = meetsWCAGContrast('#CCCCCC', '#FFFFFF', 'AA', false);

    // Assert
    expect(meets).toBe(false);
  });

  it('defaults to AA level', () => {
    // Arrange & Act
    const meets = meetsWCAGContrast('#000000', '#FFFFFF');

    // Assert
    expect(meets).toBe(true);
  });

  it('defaults to normal text size', () => {
    // Arrange & Act
    const meets = meetsWCAGContrast('#000000', '#FFFFFF', 'AA');

    // Assert
    expect(meets).toBe(true);
  });
});

describe('getFocusableElementsInOrder', () => {
  it('returns focusable elements sorted by tabindex', () => {
    // Arrange
    const container = document.createElement('div');
    const button1 = document.createElement('button');
    button1.setAttribute('tabindex', '2');
    const button2 = document.createElement('button');
    button2.setAttribute('tabindex', '1');
    const button3 = document.createElement('button');
    button3.setAttribute('tabindex', '0');
    container.appendChild(button1);
    container.appendChild(button2);
    container.appendChild(button3);

    // Act
    const elements = getFocusableElementsInOrder(container);

    // Assert
    expect(elements).toHaveLength(3);
    expect(elements[0]).toBe(button3); // tabindex 0
    expect(elements[1]).toBe(button2); // tabindex 1
    expect(elements[2]).toBe(button1); // tabindex 2
  });

  it('filters out non-focusable elements', () => {
    // Arrange
    const container = document.createElement('div');
    const button = document.createElement('button');
    const div = document.createElement('div');
    div.setAttribute('tabindex', '-1');
    container.appendChild(button);
    container.appendChild(div);

    // Act
    const elements = getFocusableElementsInOrder(container);

    // Assert
    expect(elements).toHaveLength(1);
    expect(elements[0]).toBe(button);
  });

  it('maintains DOM order for elements with same tabindex', () => {
    // Arrange
    const container = document.createElement('div');
    document.body.appendChild(container);
    const button1 = document.createElement('button');
    button1.textContent = 'Button 1';
    const button2 = document.createElement('button');
    button2.textContent = 'Button 2';
    container.appendChild(button1);
    container.appendChild(button2);

    // Act
    const elements = getFocusableElementsInOrder(container);

    // Assert
    expect(elements).toHaveLength(2);
    // Both buttons have tabindex 0 (default), so order should be maintained
    expect(elements[0]).toBe(button1);
    expect(elements[1]).toBe(button2);
    document.body.removeChild(container);
  });
});

describe('getScreenReaderText', () => {
  it('returns aria-label when present', () => {
    // Arrange
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'Close dialog');

    // Act
    const text = getScreenReaderText(button);

    // Assert
    expect(text).toBe('Close dialog');
  });

  it('returns text from aria-labelledby element', () => {
    // Arrange
    const container = document.createElement('div');
    document.body.appendChild(container);
    const label = document.createElement('span');
    label.id = 'label-id';
    label.textContent = 'Label text';
    const button = document.createElement('button');
    button.setAttribute('aria-labelledby', 'label-id');
    container.appendChild(label);
    container.appendChild(button);

    // Act
    const text = getScreenReaderText(button);

    // Assert
    expect(text).toBe('Label text');
    document.body.removeChild(container);
  });

  it('combines aria-label and aria-labelledby', () => {
    // Arrange
    const container = document.createElement('div');
    document.body.appendChild(container);
    const label = document.createElement('span');
    label.id = 'label-id';
    label.textContent = 'Label text';
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'Button');
    button.setAttribute('aria-labelledby', 'label-id');
    container.appendChild(label);
    container.appendChild(button);

    // Act
    const text = getScreenReaderText(button);

    // Assert
    expect(text).toBe('Button Label text');
    document.body.removeChild(container);
  });

  it('returns text content when no aria attributes', () => {
    // Arrange
    const button = document.createElement('button');
    button.textContent = 'Click me';

    // Act
    const text = getScreenReaderText(button);

    // Assert
    expect(text).toBe('Click me');
  });

  it('returns empty string when no labeling available', () => {
    // Arrange
    const div = document.createElement('div');

    // Act
    const text = getScreenReaderText(div);

    // Assert
    expect(text).toBe('');
  });
});


