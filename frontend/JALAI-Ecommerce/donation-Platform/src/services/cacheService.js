class CacheService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
  }

  // Set cache with expiry time (in milliseconds)
  set(key, data, expiryTime = 300000) { // Default 5 minutes
    const expiryTimestamp = Date.now() + expiryTime;
    this.cache.set(key, data);
    this.cacheExpiry.set(key, expiryTimestamp);
    
    // Also store in localStorage for persistence
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        expiry: expiryTimestamp
      }));
    } catch (error) {
      console.warn('Failed to store cache in localStorage:', error);
    }
  }

  // Get cached data if not expired
  get(key) {
    // First check memory cache
    if (this.cache.has(key)) {
      const expiry = this.cacheExpiry.get(key);
      if (Date.now() < expiry) {
        return this.cache.get(key);
      } else {
        // Expired, remove from memory
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }

    // Check localStorage cache
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const { data, expiry } = JSON.parse(stored);
        if (Date.now() < expiry) {
          // Restore to memory cache
          this.cache.set(key, data);
          this.cacheExpiry.set(key, expiry);
          return data;
        } else {
          // Expired, remove from localStorage
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to read cache from localStorage:', error);
    }

    return null;
  }

  // Check if cache exists and is valid
  has(key) {
    return this.get(key) !== null;
  }

  // Clear specific cache
  clear(key) {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    localStorage.removeItem(`cache_${key}`);
  }

  // Clear all cache
  clearAll() {
    this.cache.clear();
    this.cacheExpiry.clear();
    
    // Clear localStorage cache
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Get cache info for debugging
  getInfo() {
    const memoryKeys = Array.from(this.cache.keys());
    const localStorageKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('cache_'))
      .map(key => key.replace('cache_', ''));
    
    return {
      memoryCache: memoryKeys,
      localStorageCache: localStorageKeys,
      totalItems: memoryKeys.length
    };
  }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;
