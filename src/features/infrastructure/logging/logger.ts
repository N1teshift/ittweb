// Logger interface
interface LoggerInterface {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
}

// Error categories for categorization
export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  UNKNOWN = 'UNKNOWN'
}

// Log deduplication/throttling
interface LogEntry {
  message: string;
  timestamp: number;
  count: number;
}

const logCache = new Map<string, LogEntry>();
const DEDUP_WINDOW_MS = 5000; // 5 seconds
const MAX_REPEATED_LOGS = 3; // Max times to show same log before throttling

// Clean up old cache entries periodically
// Use a global flag to ensure cleanup is only initialized once (prevents MaxListenersExceededWarning in Next.js dev mode)
if (typeof global !== 'undefined') {
  // Use a global symbol to track if cleanup is already initialized
  // This persists across module reloads in Next.js dev mode
  const CLEANUP_KEY = Symbol.for('ittweb.logger.cleanup.initialized');
  const CLEANUP_INTERVAL_KEY = Symbol.for('ittweb.logger.cleanup.interval');
  
  if (!(global as { [key: symbol]: unknown })[CLEANUP_KEY]) {
    (global as { [key: symbol]: unknown })[CLEANUP_KEY] = true;
    
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of logCache.entries()) {
        if (now - entry.timestamp > DEDUP_WINDOW_MS * 2) {
          logCache.delete(key);
        }
      }
    }, DEDUP_WINDOW_MS * 2);
    
    // Store interval ID globally so we can clear it if needed
    (global as { [key: symbol]: unknown })[CLEANUP_INTERVAL_KEY] = cleanupInterval;
    
    // Clear interval on process exit (Node.js server-side only)
    // Only add exit listener once to prevent MaxListenersExceededWarning
    // Note: This code only runs on server-side (Node.js), not in browser
    if (typeof process !== 'undefined' && typeof window === 'undefined') {
      // Check if we've already added an exit listener for this cleanup
      // In Next.js dev mode, modules can reload, so we check listener count
      // Use optional chaining since listenerCount might not exist in all Node versions
      const exitListenerCount = typeof process.listenerCount === 'function' 
        ? process.listenerCount('exit') 
        : 0;
      
      if (exitListenerCount < 5) {
        // Only add if we don't have too many listeners already
        // The interval will be cleared when process exits anyway
        process.once('exit', () => {
          const interval = (global as { [key: symbol]: NodeJS.Timeout | undefined })[CLEANUP_INTERVAL_KEY];
          if (interval) {
            clearInterval(interval);
          }
        });
      }
      // If too many listeners exist, skip adding another - the interval will be cleared on process exit anyway
    }
    // Note: In browser environment, intervals are automatically cleared when page unloads
  }
}

function shouldThrottleLog(message: string, level: string): boolean {
  const key = `${level}:${message}`;
  const now = Date.now();
  const entry = logCache.get(key);
  
  if (!entry) {
    logCache.set(key, { message, timestamp: now, count: 1 });
    return false; // Don't throttle, first occurrence
  }
  
  // Reset if outside window
  if (now - entry.timestamp > DEDUP_WINDOW_MS) {
    logCache.set(key, { message, timestamp: now, count: 1 });
    return false; // Don't throttle, new window
  }
  
  entry.count++;
  
  // Throttle if exceeded max repeated logs
  if (entry.count > MAX_REPEATED_LOGS) {
    // Only log every 10th occurrence after initial max
    if (entry.count % 10 === 0) {
      return false; // Log this one
    }
    return true; // Throttle
  }
  
  return false; // Don't throttle, within max
}

// Simple console-based logger that works everywhere
const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  
  // Allow debug logs in production if explicitly enabled
  if (process.env.ENABLE_DEBUG_LOGS === 'true') {
    return 'debug';
  }
  
  // In development, default to 'warn' to reduce noise, but allow 'info' if explicitly enabled
  if (isDevelopment) {
    return process.env.LOG_LEVEL === 'info' ? 'info' : 'warn';
  }
  
  return 'warn';
};

const shouldLog = (level: string) => {
  const currentLevel = getLogLevel();
  const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
  return levels[level as keyof typeof levels] <= levels[currentLevel as keyof typeof levels];
};

const Logger: LoggerInterface = {
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('debug')) {
      // Don't throttle debug logs
      if (meta) {
        console.debug(`[DEBUG] ${message}`, meta);
      } else {
        console.debug(`[DEBUG] ${message}`);
      }
    }
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('info')) {
      // Throttle repetitive info logs
      if (shouldThrottleLog(message, 'info')) {
        return; // Suppress this log
      }
      
      if (meta) {
        console.info(`[INFO] ${message}`, meta);
      } else {
        console.info(`[INFO] ${message}`);
      }
    }
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('warn')) {
      // Throttle repetitive warnings more aggressively
      if (shouldThrottleLog(message, 'warn')) {
        return; // Suppress this log
      }
      
      if (meta) {
        console.warn(`[WARN] ${message}`, meta);
      } else {
        console.warn(`[WARN] ${message}`);
      }
    }
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('error')) {
      // Never throttle errors - always show them
      if (meta) {
        console.error(`[ERROR] ${message}`, meta);
      } else {
        console.error(`[ERROR] ${message}`);
      }
    }
  },
};

// Component logger factory
export function createComponentLogger(componentName: string, methodName?: string) {
  return {
    debug: (message: string, meta?: Record<string, unknown>) => 
      Logger.debug(`[${componentName}${methodName ? `:${methodName}` : ''}] ${message}`, meta),
    info: (message: string, meta?: Record<string, unknown>) => 
      Logger.info(`[${componentName}${methodName ? `:${methodName}` : ''}] ${message}`, meta),
    warn: (message: string, meta?: Record<string, unknown>) => 
      Logger.warn(`[${componentName}${methodName ? `:${methodName}` : ''}] ${message}`, meta),
    error: (message: string, error?: Error, meta?: Record<string, unknown>) => 
      Logger.error(`[${componentName}${methodName ? `:${methodName}` : ''}] ${message}`, { 
        error: error?.message, 
        stack: error?.stack,
        ...meta 
      }),
  };
}

// Error logging utilities
export function logError(
  error: Error,
  message: string,
  context: { component: string; operation: string; [key: string]: unknown }
): void {
  const category = determineErrorCategory(error);
  
  Logger.error(message, {
    category,
    error: error.message,
    stack: error.stack,
    ...context
  });

  // Send to error tracking if available
  if (typeof window !== 'undefined') {
    try {
      // Dynamic import to avoid circular dependencies
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { captureError } = require('../monitoring/errorTracking');
      captureError(error, {
        ...context,
        category,
      });
    } catch {
      // Error tracking not available - continue with console logging only
    }
  }
}

export function logAndThrow(
  error: Error,
  message: string,
  context: { component: string; operation: string; [key: string]: unknown }
): never {
  logError(error, message, context);
  throw error;
}

function determineErrorCategory(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  
  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorCategory.VALIDATION;
  }
  if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
    return ErrorCategory.NETWORK;
  }
  if (message.includes('database') || message.includes('firestore') || message.includes('firebase')) {
    return ErrorCategory.DATABASE;
  }
  if (message.includes('auth') || message.includes('unauthorized')) {
    return ErrorCategory.AUTHENTICATION;
  }
  if (message.includes('forbidden') || message.includes('permission')) {
    return ErrorCategory.AUTHORIZATION;
  }
  
  return ErrorCategory.UNKNOWN;
}

// Export the main logger for direct use
export default Logger;


