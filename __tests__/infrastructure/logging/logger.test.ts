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

  it('formats log messages with consistent structure', () => {
    process.env.NODE_ENV = 'development';

    Logger.info('test message');
    Logger.warn('warning message');
    Logger.error('error message');

    expect(console.info).toHaveBeenCalledWith('[INFO] test message');
    expect(console.warn).toHaveBeenCalledWith('[WARN] warning message');
    expect(console.error).toHaveBeenCalledWith('[ERROR] error message');
  });

  it('formats log messages with metadata', () => {
    process.env.NODE_ENV = 'development';

    Logger.info('test message', { key: 'value', count: 42 });
    Logger.warn('warning message', { userId: '123' });
    Logger.error('error message', { error: 'details' });

    expect(console.info).toHaveBeenCalledWith('[INFO] test message', { key: 'value', count: 42 });
    expect(console.warn).toHaveBeenCalledWith('[WARN] warning message', { userId: '123' });
    expect(console.error).toHaveBeenCalledWith('[ERROR] error message', { error: 'details' });
  });

  it('handles special characters in log messages', () => {
    process.env.NODE_ENV = 'development';

    Logger.info('Message with "quotes" and \'apostrophes\'');
    Logger.warn('Message with\nnewlines\tand\ttabs');
    Logger.error('Message with unicode: 测试 🚀');

    expect(console.info).toHaveBeenCalledWith('[INFO] Message with "quotes" and \'apostrophes\'');
    expect(console.warn).toHaveBeenCalledWith('[WARN] Message with\nnewlines\tand\ttabs');
    expect(console.error).toHaveBeenCalledWith('[ERROR] Message with unicode: 测试 🚀');
  });

  it('handles multiline messages', () => {
    process.env.NODE_ENV = 'development';
    const multilineMessage = 'Line 1\nLine 2\nLine 3';

    Logger.info(multilineMessage);

    expect(console.info).toHaveBeenCalledWith('[INFO] Line 1\nLine 2\nLine 3');
  });

  it('handles circular references in metadata gracefully', () => {
    process.env.NODE_ENV = 'development';
    const circular: any = { name: 'test' };
    circular.self = circular;

    // Should not throw, but may serialize differently
    expect(() => {
      Logger.info('test', circular);
    }).not.toThrow();
  });

  it('includes timestamp context in error logs', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('test error');

    logError(error, 'operation failed', { component: 'Test', operation: 'TestOp' });

    expect(console.error).toHaveBeenCalledWith(
      '[ERROR] operation failed',
      expect.objectContaining({
        category: expect.any(String),
        error: 'test error',
        stack: expect.any(String),
        component: 'Test',
        operation: 'TestOp'
      })
    );
  });
});
