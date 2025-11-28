import { Logger, ErrorCategory, createComponentLogger, logAndThrow, logError } from '@/features/infrastructure/logging';

describe('infrastructure logger', () => {
  const originalEnv = process.env;
  const originalConsole = { ...console };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    console.debug = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  it('logs info in development but suppresses debug by default', () => {
    process.env.NODE_ENV = 'development';

    Logger.debug('debug message');
    Logger.info('info message');

    expect(console.debug).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledWith('[INFO] info message');
  });

  it('allows debug logging when explicitly enabled', () => {
    process.env.NODE_ENV = 'production';
    process.env.ENABLE_DEBUG_LOGS = 'true';

    Logger.debug('debug message');

    expect(console.debug).toHaveBeenCalledWith('[DEBUG] debug message');
  });

  it('formats log messages with component prefix', () => {
    process.env.NODE_ENV = 'development';
    const componentLogger = createComponentLogger('Component', 'method');

    componentLogger.warn('a warning', { id: 1 });

    expect(console.warn).toHaveBeenCalledWith('[WARN] [Component:method] a warning', { id: 1 });
  });

  it('categorizes errors when logging', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('validation failed');

    logError(error, 'failed operation', { component: 'Comp', operation: 'Op' });

    expect(console.error).toHaveBeenCalledWith('[ERROR] failed operation', expect.objectContaining({
      category: ErrorCategory.VALIDATION,
      error: 'validation failed',
      component: 'Comp',
      operation: 'Op'
    }));
  });

  it('logs and rethrows errors via logAndThrow', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('network timeout');

    expect(() => logAndThrow(error, 'operation failed', { component: 'Comp', operation: 'Op' })).toThrow('network timeout');
    expect(console.error).toHaveBeenCalled();
  });
});
