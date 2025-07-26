/**
 * Keep-Alive Service for Backend
 * Prevents Render free tier from sleeping by pinging the backend periodically
 */

class KeepAliveService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.pingInterval = 14 * 60 * 1000; // 14 minutes (before 15-minute sleep)
    this.baseURL = import.meta.env.VITE_API_URL || 'https://jalai-ecommerce-donation-platform-3.onrender.com';
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

      // Try multiple endpoints in order of preference
      const endpoints = [
        { url: `${this.baseURL}`, auth: false, name: 'root' },
        { url: `${this.baseURL}/public/health`, auth: false, name: 'public health' },
        { url: `${this.baseURL}/actuator/health`, auth: false, name: 'actuator health' },
      ];

      let success = false;

      for (const endpoint of endpoints) {
        try {
          const token = localStorage.getItem('accessToken') || localStorage.getItem('adminToken');

          const response = await fetch(endpoint.url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(endpoint.auth && token && { 'Authorization': `Bearer ${token}` }),
            },
          });

          const endTime = Date.now();
          const responseTime = endTime - startTime;

          if (response.ok) {
            console.log(`🟢 Backend keep-alive ping successful via ${endpoint.name} (${responseTime}ms)`);
            success = true;
            break;
          } else if (response.status === 401) {
            console.log(`🟡 ${endpoint.name} requires auth (401) - backend is awake but endpoint protected`);
            success = true; // 401 means backend is running, just protected
            break;
          } else if (response.status === 404) {
            console.log(`🟡 ${endpoint.name} not found (404) - trying next endpoint`);
            continue;
          } else {
            console.log(`🟡 ${endpoint.name} responded with status: ${response.status}`);
            success = true; // Any response means backend is awake
            break;
          }
        } catch (endpointError) {
          console.log(`🟡 ${endpoint.name} failed: ${endpointError.message}`);
          continue;
        }
      }

      if (!success) {
        console.log('🔴 All keep-alive endpoints failed - backend might be sleeping');
      }

    } catch (error) {
      console.log('🔴 Keep-alive ping failed:', error.message);

      // If it's a network error, the backend might be sleeping
      if (error.message.includes('fetch')) {
        console.log('💤 Backend might be sleeping, will retry in next interval');
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
