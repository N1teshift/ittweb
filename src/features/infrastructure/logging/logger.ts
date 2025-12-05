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

// Simple console-based logger that works everywhere
const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  
  // Allow debug logs in production if explicitly enabled
  if (process.env.ENABLE_DEBUG_LOGS === 'true') {
    return 'debug';
  }
  
  return isDevelopment ? 'info' : 'warn';
};

const shouldLog = (level: string) => {
  const currentLevel = getLogLevel();
  const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
  return levels[level as keyof typeof levels] <= levels[currentLevel as keyof typeof levels];
};

const Logger: LoggerInterface = {
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('debug')) {
      if (meta) {
        console.debug(`[DEBUG] ${message}`, meta);
      } else {
        console.debug(`[DEBUG] ${message}`);
      }
    }
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('info')) {
      if (meta) {
        console.info(`[INFO] ${message}`, meta);
      } else {
        console.info(`[INFO] ${message}`);
      }
    }
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('warn')) {
      if (meta) {
        console.warn(`[WARN] ${message}`, meta);
      } else {
        console.warn(`[WARN] ${message}`);
      }
    }
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog('error')) {
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
