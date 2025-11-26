/**
 * Simple in-memory cache utility
 * 
 * Provides caching for expensive operations like file reading and parsing
 */

const cache = new Map();
const cacheTimestamps = new Map();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Clear all cache
 */
export function clearCache() {
  cache.clear();
  cacheTimestamps.clear();
}

/**
 * Clear specific cache entry
 */
export function clearCacheEntry(key) {
  cache.delete(key);
  cacheTimestamps.delete(key);
}

/**
 * Get from cache
 */
export function getCache(key) {
  const timestamp = cacheTimestamps.get(key);
  if (!timestamp) return null;
  
  const age = Date.now() - timestamp;
  const ttl = DEFAULT_TTL;
  
  if (age > ttl) {
    // Expired
    clearCacheEntry(key);
    return null;
  }
  
  return cache.get(key);
}

/**
 * Set cache entry
 */
export function setCache(key, value, ttl = DEFAULT_TTL) {
  cache.set(key, value);
  cacheTimestamps.set(key, Date.now());
}

/**
 * Cache decorator for functions
 */
export function cached(keyGenerator, ttl = DEFAULT_TTL) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args) {
      const key = typeof keyGenerator === 'function' 
        ? keyGenerator(...args) 
        : keyGenerator || `${propertyKey}_${JSON.stringify(args)}`;
      
      const cached = getCache(key);
      if (cached !== null) {
        return cached;
      }
      
      const result = originalMethod.apply(this, args);
      setCache(key, result, ttl);
      return result;
    };
    
    return descriptor;
  };
}

/**
 * Simple function wrapper for caching
 */
export function cacheFunction(fn, keyGenerator, ttl = DEFAULT_TTL) {
  return function(...args) {
    const key = typeof keyGenerator === 'function' 
      ? keyGenerator(...args) 
      : keyGenerator || `fn_${JSON.stringify(args)}`;
    
    const cached = getCache(key);
    if (cached !== null) {
      return cached;
    }
    
    const result = fn(...args);
    setCache(key, result, ttl);
    return result;
  };
}

