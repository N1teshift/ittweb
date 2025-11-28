import Logger, { ErrorCategory, createComponentLogger, logError, logAndThrow } from '@/features/shared/utils/loggerUtils';

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

  describe('createComponentLogger', () => {
    it('creates logger with component name prefix', () => {
      process.env.NODE_ENV = 'development';
      const logger = createComponentLogger('TestComponent');

      logger.info('test message');

      expect(console.info).toHaveBeenCalledWith('[INFO] [TestComponent] test message');
    });

    it('creates logger with component and method name prefix', () => {
      process.env.NODE_ENV = 'development';
      const logger = createComponentLogger('TestComponent', 'testMethod');

      logger.info('test message');

      expect(console.info).toHaveBeenCalledWith('[INFO] [TestComponent:testMethod] test message');
    });

    it('handles empty component name', () => {
      process.env.NODE_ENV = 'development';
      const logger = createComponentLogger('');

      logger.info('test message');

      expect(console.info).toHaveBeenCalledWith('[INFO] [] test message');
    });

    it('handles special characters in component name', () => {
      process.env.NODE_ENV = 'development';
      const logger = createComponentLogger('Component-Name_123');

      logger.info('test message');

      expect(console.info).toHaveBeenCalledWith('[INFO] [Component-Name_123] test message');
    });

    it('handles unicode in component name', () => {
      process.env.NODE_ENV = 'development';
      const logger = createComponentLogger('组件');

      logger.info('test message');

      expect(console.info).toHaveBeenCalledWith('[INFO] [组件] test message');
    });

    it('includes prefix in all log levels', () => {
      process.env.NODE_ENV = 'development';
      const logger = createComponentLogger('TestComponent');

      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error', new Error('test'));

      expect(console.debug).toHaveBeenCalledWith('[DEBUG] [TestComponent] debug');
      expect(console.info).toHaveBeenCalledWith('[INFO] [TestComponent] info');
      expect(console.warn).toHaveBeenCalledWith('[WARN] [TestComponent] warn');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('logError', () => {
    it('logs error with full context including stack trace', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('test error');

      logError(error, 'operation failed', { component: 'Test', operation: 'TestOp', userId: '123' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] operation failed',
        expect.objectContaining({
          category: expect.any(String),
          error: 'test error',
          stack: expect.stringContaining('Error: test error'),
          component: 'Test',
          operation: 'TestOp',
          userId: '123'
        })
      );
    });

    it('handles error without stack trace', () => {
      process.env.NODE_ENV = 'development';
      const error = { message: 'test error' } as Error;

      logError(error, 'operation failed', { component: 'Test', operation: 'TestOp' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] operation failed',
        expect.objectContaining({
          error: 'test error',
          stack: undefined
        })
      );
    });

    it('categorizes validation errors correctly', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('validation failed');

      logError(error, 'validation error', { component: 'Test', operation: 'Validate' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] validation error',
        expect.objectContaining({
          category: ErrorCategory.VALIDATION
        })
      );
    });

    it('categorizes network errors correctly', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('network timeout');

      logError(error, 'network error', { component: 'Test', operation: 'Network' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] network error',
        expect.objectContaining({
          category: ErrorCategory.NETWORK
        })
      );
    });

    it('categorizes database errors correctly', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('firestore connection failed');

      logError(error, 'db error', { component: 'Test', operation: 'DB' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] db error',
        expect.objectContaining({
          category: ErrorCategory.DATABASE
        })
      );
    });

    it('categorizes authentication errors correctly', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('unauthorized access');

      logError(error, 'auth error', { component: 'Test', operation: 'Auth' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] auth error',
        expect.objectContaining({
          category: ErrorCategory.AUTHENTICATION
        })
      );
    });

    it('categorizes authorization errors correctly', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('permission denied');

      logError(error, 'authz error', { component: 'Test', operation: 'Authz' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] authz error',
        expect.objectContaining({
          category: ErrorCategory.AUTHORIZATION
        })
      );
    });

    it('categorizes unknown errors correctly', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('something unexpected');

      logError(error, 'unknown error', { component: 'Test', operation: 'Unknown' });

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] unknown error',
        expect.objectContaining({
          category: ErrorCategory.UNKNOWN
        })
      );
    });
  });

  describe('logAndThrow', () => {
    it('logs error then rethrows it', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('test error');

      expect(() => {
        logAndThrow(error, 'operation failed', { component: 'Test', operation: 'TestOp' });
      }).toThrow('test error');

      expect(console.error).toHaveBeenCalled();
    });

    it('preserves error type when rethrowing', () => {
      process.env.NODE_ENV = 'development';
      const error = new TypeError('type error');

      expect(() => {
        logAndThrow(error, 'type error', { component: 'Test', operation: 'TestOp' });
      }).toThrow(TypeError);
    });
  });

  describe('logger behavior in different environments', () => {
    it('behaves differently in development vs production', () => {
      // Development mode
      process.env.NODE_ENV = 'development';
      Logger.debug('debug dev');
      Logger.info('info dev');

      expect(console.debug).not.toHaveBeenCalled(); // Debug suppressed by default
      expect(console.info).toHaveBeenCalledWith('[INFO] info dev');

      jest.clearAllMocks();

      // Production mode
      process.env.NODE_ENV = 'production';
      Logger.debug('debug prod');
      Logger.info('info prod');
      Logger.warn('warn prod');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('[WARN] warn prod');
    });

    it('allows debug logs in production when explicitly enabled', () => {
      process.env.NODE_ENV = 'production';
      process.env.ENABLE_DEBUG_LOGS = 'true';

      Logger.debug('debug enabled');

      expect(console.debug).toHaveBeenCalledWith('[DEBUG] debug enabled');
    });
  });
});
