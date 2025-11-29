/// <reference types="@testing-library/jest-dom" />

// Extend Jest's expect matchers with jest-dom types
import '@testing-library/jest-dom';

// Explicitly declare the matchers to ensure TypeScript recognizes them
declare global {
  namespace jest {
    interface Matchers<R = void> {
      toBeInTheDocument(): R;
      toHaveFocus(): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveClass(...classNames: string[]): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveValue(value: string | number): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toBeInvalid(): R;
      toBeValid(): R;
      toBeRequired(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(html: string): R;
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
      toHaveFormValues(values: Record<string, any>): R;
      toHaveStyle(css: string | Record<string, any>): R;
      toHaveAccessibleDescription(description: string | RegExp): R;
      toHaveAccessibleName(name: string | RegExp): R;
      toHaveErrorMessage(message: string | RegExp): R;
    }
  }
}

// Also ensure Promise matchers are extended
declare module '@jest/expect' {
  interface Matchers<R = void> {
    toBeInTheDocument(): R;
    toHaveFocus(): R;
    toBeVisible(): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toHaveClass(...classNames: string[]): R;
    toHaveAttribute(attr: string, value?: string): R;
  }
}
