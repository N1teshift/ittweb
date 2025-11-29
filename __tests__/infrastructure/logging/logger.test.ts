import { Logger, ErrorCategory, createComponentLogger, logAndThrow, logError } from '@/features/infrastructure/logging';

describe('infrastructure logger', () => {
  const originalEnv = process.env;
  const originalConsole = { ...console };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    // Allow NODE_ENV to be modified in tests
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv.NODE_ENV || 'test',
      writable: true,
      configurable: true,
    });
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
    (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
    process.env.LOG_LEVEL = 'info';

    Logger.debug('debug message');
    Logger.info('info message');

    expect(console.debug).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledWith('[INFO] info message');
  });

  it('allows debug logging when explicitly enabled', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
    process.env.ENABLE_DEBUG_LOGS = 'true';

    Logger.debug('debug message');

    expect(console.debug).toHaveBeenCalledWith('[DEBUG] debug message');
  });

  it('formats log messages with component prefix', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
    const componentLogger = createComponentLogger('Component', 'method');

    componentLogger.warn('a warning', { id: 1 });

    expect(console.warn).toHaveBeenCalledWith('[WARN] [Component:method] a warning', { id: 1 });
  });

  it('categorizes errors when logging', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
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
    (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
    const error = new Error('network timeout');

    expect(() => logAndThrow(error, 'operation failed', { component: 'Comp', operation: 'Op' })).toThrow('network timeout');
    expect(console.error).toHaveBeenCalled();
  });

  it('formats log messages with consistent structure', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
    process.env.LOG_LEVEL = 'info';

    Logger.info('test message');
    Logger.warn('warning message');
    Logger.error('error message');

    expect(console.info).toHaveBeenCalledWith('[INFO] test message');
    expect(console.warn).toHaveBeenCalledWith('[WARN] warning message');
    expect(console.error).toHaveBeenCalledWith('[ERROR] error message');
  });

  it('formats log messages with metadata', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
    process.env.LOG_LEVEL = 'info';

    Logger.info('test message', { key: 'value', count: 42 });
    Logger.warn('warning message', { userId: '123' });
    Logger.error('error message', { error: 'details' });

    expect(console.info).toHaveBeenCalledWith('[INFO] test message', { key: 'value', count: 42 });
    expect(console.warn).toHaveBeenCalledWith('[WARN] warning message', { userId: '123' });
    expect(console.error).toHaveBeenCalledWith('[ERROR] error message', { error: 'details' });
  });

  it('handles special characters in log messages', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
    process.env.LOG_LEVEL = 'info';

    Logger.info('Message with "quotes" and \'apostrophes\'');
    Logger.warn('Message with\nnewlines\tand\ttabs');
    Logger.error('Message with unicode: 测试 🚀');

    expect(console.info).toHaveBeenCalledWith('[INFO] Message with "quotes" and \'apostrophes\'');
    expect(console.warn).toHaveBeenCalledWith('[WARN] Message with\nnewlines\tand\ttabs');
    expect(console.error).toHaveBeenCalledWith('[ERROR] Message with unicode: 测试 🚀');
  });

  it('handles multiline messages', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
    process.env.LOG_LEVEL = 'info';
    const multilineMessage = 'Line 1\nLine 2\nLine 3';

    Logger.info(multilineMessage);

    expect(console.info).toHaveBeenCalledWith('[INFO] Line 1\nLine 2\nLine 3');
  });

  it('handles circular references in metadata gracefully', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
    const circular: any = { name: 'test' };
    circular.self = circular;

    // Should not throw, but may serialize differently
    expect(() => {
      Logger.info('test', circular);
    }).not.toThrow();
  });

  it('includes timestamp context in error logs', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
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

  describe('error categorization edge cases', () => {
    beforeEach(() => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
    });

    it('categorizes errors with multiple keywords (priority order)', () => {
      // Validation should take priority
      const error1 = new Error('validation failed: invalid network connection');
      logError(error1, 'test', { component: 'Test', operation: 'Test' });
      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] test',
        expect.objectContaining({ category: ErrorCategory.VALIDATION })
      );

      jest.clearAllMocks();

      // Network should take priority over database
      const error2 = new Error('network timeout: database unavailable');
      logError(error2, 'test', { component: 'Test', operation: 'Test' });
      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] test',
        expect.objectContaining({ category: ErrorCategory.NETWORK })
      );
    });

    it('handles empty error messages', () => {
      const error = new Error('');
      logError(error, 'empty error', { component: 'Test', operation: 'Test' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] empty error',
        expect.objectContaining({
          category: ErrorCategory.UNKNOWN,
          error: '',
        })
      );
    });

    it('handles error messages with only whitespace', () => {
      const error = new Error('   \n\t  ');
      logError(error, 'whitespace error', { component: 'Test', operation: 'Test' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] whitespace error',
        expect.objectContaining({
          category: ErrorCategory.UNKNOWN,
        })
      );
    });

    it('handles case-insensitive error categorization', () => {
      const error1 = new Error('VALIDATION FAILED');
      logError(error1, 'test', { component: 'Test', operation: 'Test' });
      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] test',
        expect.objectContaining({ category: ErrorCategory.VALIDATION })
      );

      jest.clearAllMocks();

      const error2 = new Error('Network Timeout');
      logError(error2, 'test', { component: 'Test', operation: 'Test' });
      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] test',
        expect.objectContaining({ category: ErrorCategory.NETWORK })
      );
    });

    it('categorizes connection errors as network', () => {
      const error = new Error('connection refused');
      logError(error, 'test', { component: 'Test', operation: 'Test' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] test',
        expect.objectContaining({ category: ErrorCategory.NETWORK })
      );
    });

    it('categorizes firebase errors as database', () => {
      const error = new Error('firebase initialization failed');
      logError(error, 'test', { component: 'Test', operation: 'Test' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] test',
        expect.objectContaining({ category: ErrorCategory.DATABASE })
      );
    });

    it('categorizes firestore errors as database', () => {
      const error = new Error('firestore query failed');
      logError(error, 'test', { component: 'Test', operation: 'Test' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] test',
        expect.objectContaining({ category: ErrorCategory.DATABASE })
      );
    });

    it('categorizes unauthorized errors as authentication', () => {
      const error = new Error('unauthorized access attempt');
      logError(error, 'test', { component: 'Test', operation: 'Test' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] test',
        expect.objectContaining({ category: ErrorCategory.AUTHENTICATION })
      );
    });

    it('categorizes forbidden errors as authorization', () => {
      const error = new Error('forbidden: insufficient permissions');
      logError(error, 'test', { component: 'Test', operation: 'Test' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] test',
        expect.objectContaining({ category: ErrorCategory.AUTHORIZATION })
      );
    });

    it('categorizes unknown errors when no keywords match', () => {
      const error = new Error('something unexpected happened');
      logError(error, 'test', { component: 'Test', operation: 'Test' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] test',
        expect.objectContaining({ category: ErrorCategory.UNKNOWN })
      );
    });
  });

  describe('component logger error method', () => {
    beforeEach(() => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
    });

    it('logs error with Error object', () => {
      const logger = createComponentLogger('TestComponent', 'testMethod');
      const error = new Error('test error');

      logger.error('operation failed', error, { userId: '123' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] [TestComponent:testMethod] operation failed',
        expect.objectContaining({
          error: 'test error',
          stack: expect.stringContaining('Error: test error'),
          userId: '123',
        })
      );
    });

    it('logs error without Error object', () => {
      const logger = createComponentLogger('TestComponent');
      logger.error('operation failed', undefined, { userId: '123' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] [TestComponent] operation failed',
        expect.objectContaining({
          error: undefined,
          stack: undefined,
          userId: '123',
        })
      );
    });

    it('logs error with Error object and metadata', () => {
      const logger = createComponentLogger('TestComponent', 'method');
      const error = new Error('test error');

      logger.error('failed', error, { component: 'Test', operation: 'Op', extra: 'data' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] [TestComponent:method] failed',
        expect.objectContaining({
          error: 'test error',
          stack: expect.any(String),
          component: 'Test',
          operation: 'Op',
          extra: 'data',
        })
      );
    });

    it('handles error without stack trace', () => {
      const logger = createComponentLogger('TestComponent');
      const error = { message: 'test error' } as Error;

      logger.error('failed', error);

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] [TestComponent] failed',
        expect.objectContaining({
          error: 'test error',
          stack: undefined,
        })
      );
    });
  });

  describe('logAndThrow edge cases', () => {
    beforeEach(() => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
    });

    it('preserves error message when rethrowing', () => {
      const error = new Error('specific error message');

      expect(() => {
        logAndThrow(error, 'operation failed', { component: 'Test', operation: 'Test' });
      }).toThrow('specific error message');
    });

    it('preserves error stack when rethrowing', () => {
      const error = new Error('test error');
      const originalStack = error.stack;

      try {
        logAndThrow(error, 'operation failed', { component: 'Test', operation: 'Test' });
      } catch (thrown) {
        expect(thrown).toBe(error);
        expect((thrown as Error).stack).toBe(originalStack);
      }
    });

    it('logs before throwing', () => {
      const error = new Error('test error');
      let logged = false;

      console.error = jest.fn(() => {
        logged = true;
      });

      try {
        logAndThrow(error, 'operation failed', { component: 'Test', operation: 'Test' });
      } catch {
        // Expected to throw
      }

      expect(logged).toBe(true);
    });
  });

  describe('logger level filtering', () => {
    it('suppresses info logs in production', () => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'production';

      Logger.info('info message');
      Logger.warn('warn message');
      Logger.error('error message');

      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('[WARN] warn message');
      expect(console.error).toHaveBeenCalledWith('[ERROR] error message');
    });

    it('allows all levels when debug is enabled', () => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
      process.env.ENABLE_DEBUG_LOGS = 'true';

      Logger.debug('debug message');
      Logger.info('info message');
      Logger.warn('warn message');
      Logger.error('error message');

      expect(console.debug).toHaveBeenCalledWith('[DEBUG] debug message');
      expect(console.info).toHaveBeenCalledWith('[INFO] info message');
      expect(console.warn).toHaveBeenCalledWith('[WARN] warn message');
      expect(console.error).toHaveBeenCalledWith('[ERROR] error message');
    });

    it('always logs error level regardless of environment', () => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
      delete process.env.ENABLE_DEBUG_LOGS;

      Logger.error('error message');

      expect(console.error).toHaveBeenCalledWith('[ERROR] error message');
    });
  });

  describe('logError context handling', () => {
    beforeEach(() => {
      (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
    });

    it('includes all context properties in error log', () => {
      const error = new Error('test error');
      const context = {
        component: 'TestComponent',
        operation: 'TestOperation',
        userId: 'user123',
        gameId: 'game456',
        timestamp: Date.now(),
      };

      logError(error, 'operation failed', context);

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] operation failed',
        expect.objectContaining(context)
      );
    });

    it('handles context with nested objects', () => {
      const error = new Error('test error');
      const context = {
        component: 'Test',
        operation: 'Test',
        metadata: {
          nested: {
            value: 'test',
          },
        },
      };

      expect(() => {
        logError(error, 'test', context);
      }).not.toThrow();
    });

    it('handles context with arrays', () => {
      const error = new Error('test error');
      const context = {
        component: 'Test',
        operation: 'Test',
        items: [1, 2, 3],
      };

      expect(() => {
        logError(error, 'test', context);
      }).not.toThrow();
    });
  });
});
