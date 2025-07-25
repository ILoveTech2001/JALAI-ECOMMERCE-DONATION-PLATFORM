/**
 * Keep-Alive Service for Backend
 * Prevents Render free tier from sleeping by pinging the backend periodically
 */

class KeepAliveService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.pingInterval = 14 * 60 * 1000; // 14 minutes (before 15-minute sleep)
    this.baseURL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  }

  /**
   * Start the keep-alive service
   */
  start() {
    if (this.isRunning) {
      console.log('🟡 Keep-alive service already running');
      return;
    }

    console.log('🟢 Starting backend keep-alive service...');
    console.log(`🔄 Will ping ${this.baseURL} every ${this.pingInterval / 60000} minutes`);

    // Initial ping
    this.ping();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.pingInterval);

    this.isRunning = true;
  }

  /**
   * Stop the keep-alive service
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🔴 Keep-alive service stopped');
  }

  /**
   * Ping the backend to keep it awake
   */
  async ping() {
    try {
      const startTime = Date.now();
      
      // Try to ping a lightweight endpoint
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Don't include credentials for keep-alive pings
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        console.log(`🟢 Backend keep-alive ping successful (${responseTime}ms)`);
      } else {
        console.log(`🟡 Backend responded but with status: ${response.status}`);
      }
    } catch (error) {
      // Try alternative endpoint if /health doesn't exist
      try {
        const response = await fetch(`${this.baseURL}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log('🟢 Backend keep-alive ping successful (fallback endpoint)');
        } else {
          console.log(`🟡 Backend responded to fallback with status: ${response.status}`);
        }
      } catch (fallbackError) {
        console.log('🔴 Keep-alive ping failed:', fallbackError.message);
        
        // If it's a network error, the backend might be sleeping
        if (fallbackError.message.includes('fetch')) {
          console.log('💤 Backend might be sleeping, will retry in next interval');
        }
      }
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId,
      pingInterval: this.pingInterval,
      baseURL: this.baseURL
    };
  }
}

// Create singleton instance
const keepAliveService = new KeepAliveService();

export default keepAliveService;
