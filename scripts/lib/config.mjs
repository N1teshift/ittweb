/**
 * Configuration constants
 * 
 * Centralized configuration for thresholds, limits, and behavior settings
 */

export const CONFIG = {
  // Fuzzy matching
  FUZZY_MATCH: {
    MIN_SIMILARITY: 0.5,
    MAX_RESULTS: 5,
    PREFIXES_TO_STRIP: ['btn', 'atc', 'pas', 'dis'],
  },
  
  // Icon file operations
  ICON_FILES: {
    EXTENSIONS: ['.png'],
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  },
  
  // Parsing
  PARSING: {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_ENTRIES: 100000,
  },
  
  // Caching
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    ICON_FILES_TTL: 10 * 60 * 1000, // 10 minutes
    PARSED_DATA_TTL: 15 * 60 * 1000, // 15 minutes
  },
  
  // Reporting
  REPORTING: {
    MAX_UNMAPPED_EXAMPLES: 50,
    MAX_FUZZY_MATCHES: 20,
    MAX_ERRORS_TO_SHOW: 100,
  },
  
  // Validation
  VALIDATION: {
    MAX_NAME_LENGTH: 200,
    MAX_ID_LENGTH: 100,
    MAX_PATH_LENGTH: 500,
  },
};

/**
 * Get config value with dot notation (e.g., 'FUZZY_MATCH.MIN_SIMILARITY')
 */
export function getConfig(path, defaultValue = null) {
  const parts = path.split('.');
  let value = CONFIG;
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return defaultValue;
    }
  }
  
  return value;
}

