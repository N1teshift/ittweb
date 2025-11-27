/**
 * Logging utility
 * 
 * Centralized logging with levels and optional file output
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

let currentLevel = LOG_LEVELS.INFO;
let logFile = null;

/**
 * Set logging level
 * @param {string} level - 'error', 'warn', 'info', or 'debug'
 */
export function setLogLevel(level) {
  const levelMap = {
    error: LOG_LEVELS.ERROR,
    warn: LOG_LEVELS.WARN,
    info: LOG_LEVELS.INFO,
    debug: LOG_LEVELS.DEBUG,
  };
  currentLevel = levelMap[level.toLowerCase()] ?? LOG_LEVELS.INFO;
}

/**
 * Enable file logging
 * @param {string} filePath - Path to log file
 */
export function setLogFile(filePath) {
  logFile = filePath;
}

/**
 * Write to log file if enabled
 */
function writeToFile(message) {
  if (logFile) {
    const fs = require('fs');
    fs.appendFileSync(logFile, message + '\n', 'utf-8');
  }
}

/**
 * Format log message
 */
function formatMessage(level, message, ...args) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ') : '';
  return `${prefix} ${message}${formattedArgs}`;
}

/**
 * Log error
 */
export function error(message, ...args) {
  if (currentLevel >= LOG_LEVELS.ERROR) {
    const formatted = formatMessage('error', message, ...args);
    console.error(formatted);
    writeToFile(formatted);
  }
}

/**
 * Log warning
 */
export function warn(message, ...args) {
  if (currentLevel >= LOG_LEVELS.WARN) {
    const formatted = formatMessage('warn', message, ...args);
    console.warn(formatted);
    writeToFile(formatted);
  }
}

/**
 * Log info
 */
export function info(message, ...args) {
  if (currentLevel >= LOG_LEVELS.INFO) {
    const formatted = formatMessage('info', message, ...args);
    console.log(formatted);
    writeToFile(formatted);
  }
}

/**
 * Log debug
 */
export function debug(message, ...args) {
  if (currentLevel >= LOG_LEVELS.DEBUG) {
    const formatted = formatMessage('debug', message, ...args);
    console.log(formatted);
    writeToFile(formatted);
  }
}

/**
 * Create a scoped logger for a specific module
 */
export function createLogger(moduleName) {
  return {
    error: (msg, ...args) => error(`[${moduleName}] ${msg}`, ...args),
    warn: (msg, ...args) => warn(`[${moduleName}] ${msg}`, ...args),
    info: (msg, ...args) => info(`[${moduleName}] ${msg}`, ...args),
    debug: (msg, ...args) => debug(`[${moduleName}] ${msg}`, ...args),
  };
}



