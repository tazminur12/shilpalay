/**
 * Caching utilities for API responses and static data
 * Uses in-memory cache with TTL (Time To Live)
 */

const cache = new Map();

/**
 * Get cached value
 * @param {string} key - Cache key
 * @returns {any|null} - Cached value or null if expired/not found
 */
export function getCache(key) {
  const item = cache.get(key);
  
  if (!item) {
    return null;
  }
  
  // Check if expired
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return item.value;
}

/**
 * Set cache value
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
 */
export function setCache(key, value, ttlSeconds = 300) {
  const expiresAt = Date.now() + (ttlSeconds * 1000);
  cache.set(key, {
    value,
    expiresAt,
    createdAt: Date.now(),
  });
}

/**
 * Delete cache entry
 * @param {string} key - Cache key
 */
export function deleteCache(key) {
  cache.delete(key);
}

/**
 * Clear all cache
 */
export function clearCache() {
  cache.clear();
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache() {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now > item.expiresAt) {
      cache.delete(key);
    }
  }
}

/**
 * Get cache statistics
 * @returns {object} - Cache stats
 */
export function getCacheStats() {
  const now = Date.now();
  let expired = 0;
  let active = 0;
  
  for (const item of cache.values()) {
    if (now > item.expiresAt) {
      expired++;
    } else {
      active++;
    }
  }
  
  return {
    total: cache.size,
    active,
    expired,
  };
}

/**
 * Generate cache key from request parameters
 * @param {string} base - Base key (e.g., 'products')
 * @param {object} params - Parameters object
 * @returns {string} - Generated cache key
 */
export function generateCacheKey(base, params = {}) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return sortedParams ? `${base}:${sortedParams}` : base;
}

// Clean expired cache every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(clearExpiredCache, 5 * 60 * 1000);
}
