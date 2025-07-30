// Log Limiter Utility for JALAI Platform
// Prevents excessive console logging that can slow down the browser

class LogLimiter {
  constructor(options = {}) {
    this.maxLogsPerMessage = options.maxLogsPerMessage || 5;
    this.resetInterval = options.resetInterval || 60000; // 1 minute
    this.logCounts = new Map();
    this.suppressedCounts = new Map();
    
    // Reset counts periodically
    this.resetTimer = setInterval(() => {
      this.reset();
    }, this.resetInterval);
  }

  // Create a normalized key for grouping similar messages
  createMessageKey(message) {
    return message
      .replace(/\d+/g, 'X') // Replace numbers with X
      .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, 'UUID') // Replace UUIDs
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, 'IP') // Replace IP addresses
      .replace(/https?:\/\/[^\s]+/g, 'URL') // Replace URLs
      .substring(0, 100); // Limit key length
  }

  // Check if a message should be logged
  shouldLog(message, context = '') {
    const messageKey = `${context}:${this.createMessageKey(message)}`;
    const count = this.logCounts.get(messageKey) || 0;
    
    if (count >= this.maxLogsPerMessage) {
      // Track suppressed logs
      const suppressed = this.suppressedCounts.get(messageKey) || 0;
      this.suppressedCounts.set(messageKey, suppressed + 1);
      return false;
    }
    
    this.logCounts.set(messageKey, count + 1);
    
    // Show warning when approaching limit
    if (count === this.maxLogsPerMessage - 1) {
      console.warn(`🔇 Log limit reached for: "${messageKey.substring(0, 50)}...". Further instances will be suppressed.`);
    }
    
    return true;
  }

  // Reset all counters and show summary
  reset() {
    if (this.suppressedCounts.size > 0) {
      console.groupCollapsed('📊 Log Limiter Summary - Suppressed Messages');
      for (const [key, count] of this.suppressedCounts.entries()) {
        console.log(`${key}: ${count} suppressed`);
      }
      console.groupEnd();
    }
    
    this.logCounts.clear();
    this.suppressedCounts.clear();
  }

  // Get current stats
  getStats() {
    return {
      activeMessages: this.logCounts.size,
      suppressedMessages: this.suppressedCounts.size,
      totalSuppressed: Array.from(this.suppressedCounts.values()).reduce((a, b) => a + b, 0)
    };
  }

  // Cleanup
  destroy() {
    if (this.resetTimer) {
      clearInterval(this.resetTimer);
    }
    this.logCounts.clear();
    this.suppressedCounts.clear();
  }
}

// Create global instance
const globalLogLimiter = new LogLimiter();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.globalLogLimiter = globalLogLimiter;
}

// Enhanced console methods with limiting
const limitedConsole = {
  log: (message, ...args) => {
    if (globalLogLimiter.shouldLog(message, 'LOG')) {
      console.log(message, ...args);
    }
  },
  
  warn: (message, ...args) => {
    if (globalLogLimiter.shouldLog(message, 'WARN')) {
      console.warn(message, ...args);
    }
  },
  
  error: (message, ...args) => {
    // Always allow errors, but still track them
    if (globalLogLimiter.shouldLog(message, 'ERROR')) {
      console.error(message, ...args);
    } else {
      // For suppressed errors, at least show a minimal version
      console.error('🔇 [SUPPRESSED ERROR]', message.substring(0, 50) + '...');
    }
  },
  
  info: (message, ...args) => {
    if (globalLogLimiter.shouldLog(message, 'INFO')) {
      console.info(message, ...args);
    }
  },
  
  debug: (message, ...args) => {
    if (localStorage.getItem('debugAPI') === 'true' && globalLogLimiter.shouldLog(message, 'DEBUG')) {
      console.debug(message, ...args);
    }
  }
};

// Utility function for conditional logging with context
const conditionalLog = (condition, message, data = null, level = 'log', context = '') => {
  if (!condition) return;
  
  const logMethod = limitedConsole[level] || limitedConsole.log;
  logMethod(message, data);
};

// Export for use in other modules
export { LogLimiter, globalLogLimiter, limitedConsole, conditionalLog };
export default globalLogLimiter;
