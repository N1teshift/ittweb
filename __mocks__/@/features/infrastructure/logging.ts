export const createComponentLogger = jest.fn(() => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
export const logError = jest.fn();
