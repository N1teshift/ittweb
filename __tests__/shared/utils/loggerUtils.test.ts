import Logger, { ErrorCategory, createComponentLogger, logError } from '@/features/shared/utils/loggerUtils';

describe('shared logger utils', () => {
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

  it('logs warnings in production but suppresses info', () => {
    process.env.NODE_ENV = 'production';

    Logger.info('info message');
    Logger.warn('warn message');

    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('[WARN] warn message');
  });

  it('creates prefixed component loggers', () => {
    process.env.NODE_ENV = 'development';
    const componentLogger = createComponentLogger('Shared', 'method');

    componentLogger.warn('careful');

    expect(console.warn).toHaveBeenCalledWith('[WARN] [Shared:method] careful');
  });

  it('maps errors to categories in logError', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('database unavailable');

    logError(error, 'failed db call', { component: 'Shared', operation: 'call' });

    expect(console.error).toHaveBeenCalledWith('[ERROR] failed db call', expect.objectContaining({
      category: ErrorCategory.DATABASE,
      error: 'database unavailable',
      component: 'Shared',
      operation: 'call'
    }));
  });
});
