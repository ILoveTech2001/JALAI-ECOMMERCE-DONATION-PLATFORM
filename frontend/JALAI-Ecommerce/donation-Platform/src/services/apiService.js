// API Service for JALAI Donation Platform
import { limitedConsole } from '../utils/logLimiter.js';

class ApiService {
  constructor() {
    // Use environment variable for production, fallback to localhost for development
    // Support both Vite (VITE_) and Create React App (REACT_APP_) environment variables
    const baseURL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'https://jalai-ecommerce-donation-platform-3.onrender.com';

    // Ensure the base URL includes /api path
    this.baseURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;

    // Only log in debug mode with limiting
    if (localStorage.getItem('debugAPI') === 'true') {
      limitedConsole.log('🔧 API Service initialized with baseURL:', this.baseURL);
    }
    this.token = localStorage.getItem('accessToken') || localStorage.getItem('adminToken');
    this.cache = new Map(); // Simple in-memory cache to reduce API calls
  }

  // Cache management methods to reduce server load
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCachedData(key, data, ttlMs = 5 * 60 * 1000) { // Default 5 minutes
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }

  clearCache() {
    this.cache.clear();
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('refreshToken');
  }

  // Public request method (no authentication required)
  async publicRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      // Only log in development mode
      if (import.meta.env.DEV) {
        console.log(`Making public API request to: ${url}`);
      }
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Public API request failed: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const textResponse = await response.text();
        if (import.meta.env.DEV) {
          console.log(`Non-JSON response from ${url}:`, textResponse);
        }
        try {
          return JSON.parse(textResponse);
        } catch {
          return { message: textResponse, rawResponse: textResponse };
        }
      }
    } catch (error) {
      console.error('Public API request failed:', error);
      throw error;
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // CRITICAL: Always get fresh token from localStorage
    const currentToken = localStorage.getItem('accessToken') || localStorage.getItem('adminToken') || this.token;

    // Update instance token if we found one in localStorage
    if (currentToken && !this.token) {
      this.token = currentToken;
    }

    // Debug authentication for order creation (only in dev mode)
    if (import.meta.env.DEV && endpoint.includes('orders/create-from-cart')) {
      console.log('=== ORDER CREATION REQUEST DEBUG ===');
      console.log('URL:', url);
      console.log('this.token:', this.token ? `${this.token.substring(0, 20)}...` : 'NO TOKEN');
      console.log('localStorage accessToken:', localStorage.getItem('accessToken') ? 'EXISTS' : 'MISSING');
      console.log('localStorage token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
      console.log('localStorage userData:', localStorage.getItem('userData') ? 'EXISTS' : 'MISSING');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(currentToken && { 'Authorization': `Bearer ${currentToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      // Only log in development mode
      if (import.meta.env.DEV) {
        console.log(`Making API request to: ${url}`);
        if (endpoint.includes('orders/create-from-cart')) {
          console.log('Request headers:', config.headers);
        }
      }
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the original request with new token
            config.headers['Authorization'] = `Bearer ${this.token}`;
            const retryResponse = await fetch(url, config);
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
          }
          // If refresh failed, clear tokens but don't auto-redirect
          console.log('🔴 Token refresh failed, clearing tokens');
          this.clearToken();
          // Don't auto-redirect - let the component handle it
          throw new Error('Authentication failed. Please log in again.');
        }

        if (response.status === 403) {
          // Forbidden - user is authenticated but not authorized
          // Don't clear tokens, just throw an error
          const errorData = await response.text();
          console.log('403 Forbidden error:', errorData);
          const error = new Error(`Access denied: ${errorData || 'You do not have permission to access this resource'}`);
          error.status = 403;
          error.response = errorData;
          throw error;
        }

        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error(`API Error: ${errorMessage}`, { url, status: response.status, errorData });

        // Create error with response information for better handling
        const error = new Error(errorMessage);
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        };
        error.request = { url, method: options.method || 'GET' };
        throw error;
      }

      const contentType = response.headers.get('content-type');
      console.log(`Response content-type: ${contentType}`); // Debug log

      // Always read as text first to avoid stream consumption issues
      const textResponse = await response.text();
      console.log(`Raw response from ${url}:`, textResponse); // Debug log

      if (contentType && contentType.includes('application/json')) {
        try {
          const jsonResponse = JSON.parse(textResponse);
          console.log(`API Response from ${url}:`, jsonResponse); // Debug log
          return jsonResponse;
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          console.log(`Raw response text:`, textResponse);
          throw new Error(`Invalid JSON response: ${textResponse}`);
        }
      } else {
        // Handle non-JSON responses
        console.log(`Non-JSON response from ${url}:`, textResponse);

        // Try to parse as JSON anyway (some servers don't set correct content-type)
        try {
          const jsonResponse = JSON.parse(textResponse);
          console.log(`Parsed JSON from text response:`, jsonResponse);
          return jsonResponse;
        } catch {
          console.log(`Response is not JSON, returning as text:`, textResponse);
          return { message: textResponse, rawResponse: textResponse };
        }
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network error - Backend server may not be running:', error);
        const networkError = new Error(`Unable to connect to server. Please check your internet connection and try again.`);
        networkError.request = { url, method: options.method || 'GET' };
        networkError.isNetworkError = true;
        throw networkError;
      }
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    try {
      // Only log in debug mode
      const debugMode = localStorage.getItem('debugAuth') === 'true';

      if (debugMode) {
        console.log('🔧 Attempting login to:', `${this.baseURL}/auth/login`);
        console.log('🔧 Login credentials:', { email, password: '***' });
      }

      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (debugMode) {
        console.log('🔧 API login response:', response);
        console.log('🔧 Response type:', typeof response);
        console.log('🔧 Response keys:', response ? Object.keys(response) : 'null');
      }

      if (response && response.accessToken) {
        console.log('🟢 Login successful - setting token');
        this.setToken(response.accessToken);
        if (response.user) {
          localStorage.setItem('userData', JSON.stringify(response.user));
        }
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      } else {
        console.error('🔴 Login response missing accessToken:', response);
        throw new Error('Login failed: No access token received');
      }

      return response;
    } catch (error) {
      console.error('🔴 Login error:', error);
      console.error('🔴 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }

  async register(userData, userType = 'client') {
    const response = await this.request(`/auth/register/${userType}`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    console.log('API register response:', response); // Debug log

    if (response && response.accessToken) {
      this.setToken(response.accessToken);
      if (response.user) {
        localStorage.setItem('userData', JSON.stringify(response.user));
      }
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
    } else {
      console.error('Register response missing accessToken:', response);
    }

    return response;
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await this.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.accessToken) {
        this.setToken(response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.clearToken();
    }
  }

  // Generic HTTP methods
  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = null) {
    const options = {
      method: 'PUT',
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    return this.request(endpoint, options);
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Product methods
  async getProducts(page = 0, size = 10) {
    return this.publicRequest(`/products/approved?page=${page}&size=${size}`);
  }

  async getProduct(id) {
    return this.publicRequest(`/products/${id}`);
  }

  async searchProducts(keyword, page = 0, size = 10) {
    return this.publicRequest(`/products/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
  }

  async getProductsByCategory(categoryId, page = 0, size = 10) {
    return this.request(`/products/category/${categoryId}?page=${page}&size=${size}`);
  }

  async getApprovedProducts(page = 0, size = 10) {
    try {
      return await this.publicRequest(`/products/approved?page=${page}&size=${size}`);
    } catch (error) {
      console.warn('Failed to fetch approved products, using fallback data:', error);
      // Return a mix of products from all categories
      const allProducts = [
        ...this.getFallbackProductsForCategory('Clothing', 3),
        ...this.getFallbackProductsForCategory('Footwear', 3),
        ...this.getFallbackProductsForCategory('Utensils', 2),
        ...this.getFallbackProductsForCategory('Electronics', 2)
      ];

      return {
        content: allProducts.slice(page * size, (page + 1) * size),
        totalElements: allProducts.length,
        totalPages: Math.ceil(allProducts.length / size),
        number: page,
        size: size,
        first: page === 0,
        last: (page + 1) * size >= allProducts.length
      };
    }
  }

  async getApprovedProductsByCategory(categoryName, page = 0, size = 4) {
    try {
      // Check cache first to reduce API calls
      const cacheKey = `products_category_${categoryName}_${page}_${size}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await this.publicRequest(`/products/approved/category/${encodeURIComponent(categoryName)}?page=${page}&size=${size}`);

      // Cache for 3 minutes
      this.setCachedData(cacheKey, response, 3 * 60 * 1000);

      return response;
    } catch (error) {
      if (localStorage.getItem('debugAPI') === 'true') {
        console.warn(`Failed to fetch products for category ${categoryName}, using fallback data:`, error);
      }
      // Return fallback data structure that matches expected API response
      return {
        content: this.getFallbackProductsForCategory(categoryName, size),
        totalElements: size,
        totalPages: 1,
        number: page,
        size: size,
        first: true,
        last: true
      };
    }
  }

  async createProduct(productData) {
    // Only log in debug mode with limiting to reduce console spam
    if (localStorage.getItem('debugAPI') === 'true') {
      limitedConsole.log('🚀 Creating product with data:', {
        name: productData.name,
        price: productData.price,
        description: productData.description?.substring(0, 50) + '...',
        categoryId: productData.categoryId,
        sellerId: productData.sellerId,
        hasImageUrl: !!productData.imageUrl,
        imageUrlType: productData.imageUrl?.startsWith('data:') ? 'base64' : 'url',
        imageUrlLength: productData.imageUrl?.length
      });
    }

    try {
      const response = await this.request('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });

      if (localStorage.getItem('debugAPI') === 'true') {
        limitedConsole.log('✅ Product created successfully:', response);
      }
      return response;
    } catch (error) {
      // Always log errors but with limiting
      limitedConsole.error('❌ Failed to create product:', error.message || error);
      throw error;
    }
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async getProductById(id) {
    return this.request(`/products/${id}`);
  }

  async approveProduct(id, reason = '') {
    return this.request(`/products/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async rejectProduct(id, reason) {
    return this.request(`/products/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // Notification methods
  async getAllNotifications() {
    return this.request('/notifications/all');
  }

  async getNotificationsByClient(clientId) {
    return this.request(`/notifications/client/${clientId}`);
  }

  async getUnreadNotificationsByClient(clientId) {
    return this.request(`/notifications/client/${clientId}/unread`);
  }

  async getUnreadCountByClient(clientId) {
    return this.request(`/notifications/client/${clientId}/unread/count`);
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(clientId) {
    return this.request(`/notifications/client/${clientId}/read-all`, {
      method: 'PUT',
    });
  }

  async createNotification(notificationData) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  async getProductsByClient(clientId) {
    // Check cache first to reduce API calls
    const cacheKey = `products_client_${clientId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.request(`/products/client/${clientId}`);

    // Cache for 2 minutes
    this.setCachedData(cacheKey, response, 2 * 60 * 1000);

    return response;
  }

  // User data methods
  async getDonationsByClient(clientId) {
    return this.request(`/donations/client/${clientId}`);
  }



  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Cart methods
  async getCart(clientId) {
    return this.request(`/cart/${clientId}`);
  }

  async addToCart(clientId, productId, quantity = 1) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ clientId, productId, quantity }),
    });
  }

  async updateCartItem(clientId, productId, quantity) {
    return this.request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ clientId, productId, quantity }),
    });
  }

  async removeFromCart(clientId, productId) {
    return this.request(`/cart/remove?clientId=${clientId}&productId=${productId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(clientId) {
    return this.request(`/cart/clear/${clientId}`, {
      method: 'DELETE',
    });
  }

  // Order methods
  async getAllOrders(page = 0, size = 10) {
    return this.request(`/orders?page=${page}&size=${size}`);
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async getOrdersByClient(clientId, page = 0, size = 10) {
    return this.request(`/orders/client/${clientId}?page=${page}&size=${size}`);
  }

  async createOrderFromCart(clientId, deliveryDate) {
    const requestBody = { clientId, deliveryDate };
    console.log('createOrderFromCart request body:', requestBody);
    console.log('clientId type:', typeof clientId);
    console.log('deliveryDate type:', typeof deliveryDate);

    // Check authentication
    const token = localStorage.getItem('token');
    console.log('Auth token exists:', !!token);
    console.log('Auth token length:', token ? token.length : 0);

    try {
      const response = await this.request('/orders/create-from-cart', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      console.log('Order creation successful:', response);
      return response;
    } catch (error) {
      console.error('Order creation failed:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/orders/${orderId}/status?status=${status}`, {
      method: 'PUT',
    });
  }

  // Donation methods
  async getAllDonations(page = 0, size = 10) {
    return this.request(`/donations?page=${page}&size=${size}`);
  }

  async getDonation(id) {
    return this.request(`/donations/${id}`);
  }

  async createDonation(donationData) {
    return this.request('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  async confirmDonation(id) {
    return this.request(`/donations/${id}/confirm`, {
      method: 'POST',
    });
  }

  // Category methods
  async getCategories() {
    try {
      // Check cache first to reduce API calls
      const cacheKey = 'categories_public';
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }

      // Only log in debug mode with limiting
      if (localStorage.getItem('debugAPI') === 'true') {
        limitedConsole.log('🔍 Fetching categories from:', `${this.baseURL}/categories/public`);
      }

      const response = await this.publicRequest('/categories/public');

      // Cache the response for 5 minutes
      this.setCachedData(cacheKey, response, 5 * 60 * 1000);

      if (localStorage.getItem('debugAPI') === 'true') {
        limitedConsole.log('✅ Categories fetched successfully:', response);
      }
      return response;
    } catch (error) {
      // Reduce error logging frequency
      if (localStorage.getItem('debugAPI') === 'true') {
        limitedConsole.error('❌ Failed to fetch categories from backend:', error);
      }

      // Only show fallback message once per session
      if (!sessionStorage.getItem('categoriesFallbackShown')) {
        console.warn('🔄 Using fallback categories due to backend connection issue');
        sessionStorage.setItem('categoriesFallbackShown', 'true');
      }

      // Return fallback categories with proper structure
      return [
        { id: 1, name: 'Clothing', description: 'Clothing and apparel items', isActive: true, createdAt: new Date().toISOString() },
        { id: 2, name: 'Footwear', description: 'Shoes and footwear items', isActive: true, createdAt: new Date().toISOString() },
        { id: 3, name: 'Utensils', description: 'Kitchen and dining utensils', isActive: true, createdAt: new Date().toISOString() },
        { id: 4, name: 'Electronics', description: 'Electronic devices and gadgets', isActive: true, createdAt: new Date().toISOString() },
        { id: 5, name: 'Furniture', description: 'Furniture and home items', isActive: true, createdAt: new Date().toISOString() }
      ];
    }
  }

  async createCategory(categoryData) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id, categoryData) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Fallback method to provide sample products when API is unavailable
  getFallbackProductsForCategory(categoryName, size = 4) {
    const fallbackProducts = {
      'Clothing': [
        {
          id: 1,
          name: 'Vintage Denim Jacket',
          description: 'Classic denim jacket in excellent condition',
          price: 25.00,
          imageUrl: '/sample-clothing-1.jpg',
          category: 'Clothing',
          condition: 'Good',
          seller: { name: 'John Doe' }
        },
        {
          id: 2,
          name: 'Cotton T-Shirt',
          description: 'Comfortable cotton t-shirt, barely used',
          price: 10.00,
          imageUrl: '/sample-clothing-2.jpg',
          category: 'Clothing',
          condition: 'Excellent',
          seller: { name: 'Jane Smith' }
        },
        {
          id: 3,
          name: 'Wool Sweater',
          description: 'Warm wool sweater for winter',
          price: 30.00,
          imageUrl: '/sample-clothing-3.jpg',
          category: 'Clothing',
          condition: 'Good',
          seller: { name: 'Mike Johnson' }
        },
        {
          id: 4,
          name: 'Summer Dress',
          description: 'Light summer dress, perfect for warm weather',
          price: 20.00,
          imageUrl: '/sample-clothing-4.jpg',
          category: 'Clothing',
          condition: 'Excellent',
          seller: { name: 'Sarah Wilson' }
        }
      ],
      'Footwear': [
        {
          id: 5,
          name: 'Running Shoes',
          description: 'Comfortable running shoes, lightly used',
          price: 40.00,
          imageUrl: '/sample-footwear-1.jpg',
          category: 'Footwear',
          condition: 'Good',
          seller: { name: 'Tom Brown' }
        },
        {
          id: 6,
          name: 'Leather Boots',
          description: 'Durable leather boots for outdoor activities',
          price: 60.00,
          imageUrl: '/sample-footwear-2.jpg',
          category: 'Footwear',
          condition: 'Excellent',
          seller: { name: 'Lisa Davis' }
        },
        {
          id: 7,
          name: 'Casual Sneakers',
          description: 'Stylish casual sneakers for everyday wear',
          price: 35.00,
          imageUrl: '/sample-footwear-3.jpg',
          category: 'Footwear',
          condition: 'Good',
          seller: { name: 'Alex Chen' }
        },
        {
          id: 8,
          name: 'High Heels',
          description: 'Elegant high heels for special occasions',
          price: 45.00,
          imageUrl: '/sample-footwear-4.jpg',
          category: 'Footwear',
          condition: 'Excellent',
          seller: { name: 'Emma Taylor' }
        }
      ],
      'Utensils': [
        {
          id: 9,
          name: 'Kitchen Knife Set',
          description: 'Professional kitchen knife set with wooden block',
          price: 50.00,
          imageUrl: '/sample-utensils-1.jpg',
          category: 'Utensils',
          condition: 'Good',
          seller: { name: 'Chef Mario' }
        },
        {
          id: 10,
          name: 'Ceramic Plates Set',
          description: 'Beautiful ceramic dinner plates, set of 6',
          price: 30.00,
          imageUrl: '/sample-utensils-2.jpg',
          category: 'Utensils',
          condition: 'Excellent',
          seller: { name: 'Anna Garcia' }
        },
        {
          id: 11,
          name: 'Stainless Steel Pots',
          description: 'Durable stainless steel cooking pots',
          price: 40.00,
          imageUrl: '/sample-utensils-3.jpg',
          category: 'Utensils',
          condition: 'Good',
          seller: { name: 'Robert Lee' }
        },
        {
          id: 12,
          name: 'Glass Bowls Set',
          description: 'Clear glass mixing bowls, various sizes',
          price: 25.00,
          imageUrl: '/sample-utensils-4.jpg',
          category: 'Utensils',
          condition: 'Excellent',
          seller: { name: 'Maria Rodriguez' }
        }
      ],
      'Electronics': [
        {
          id: 13,
          name: 'Bluetooth Speaker',
          description: 'Portable bluetooth speaker with great sound quality',
          price: 80.00,
          imageUrl: '/sample-electronics-1.jpg',
          category: 'Electronics',
          condition: 'Good',
          seller: { name: 'Tech Guru' }
        },
        {
          id: 14,
          name: 'Tablet',
          description: '10-inch tablet, perfect for reading and browsing',
          price: 150.00,
          imageUrl: '/sample-electronics-2.jpg',
          category: 'Electronics',
          condition: 'Excellent',
          seller: { name: 'Digital Dave' }
        },
        {
          id: 15,
          name: 'Wireless Headphones',
          description: 'Noise-cancelling wireless headphones',
          price: 120.00,
          imageUrl: '/sample-electronics-3.jpg',
          category: 'Electronics',
          condition: 'Good',
          seller: { name: 'Audio Annie' }
        },
        {
          id: 16,
          name: 'Smart Watch',
          description: 'Fitness tracking smart watch with heart rate monitor',
          price: 200.00,
          imageUrl: '/sample-electronics-4.jpg',
          category: 'Electronics',
          condition: 'Excellent',
          seller: { name: 'Fitness Frank' }
        }
      ],
      'Furniture': [
        {
          id: 17,
          name: 'Wooden Chair',
          description: 'Comfortable wooden dining chair',
          price: 35.00,
          imageUrl: '/sample-furniture-1.jpg',
          category: 'Furniture',
          condition: 'Good',
          seller: { name: 'Carpenter Carl' }
        },
        {
          id: 18,
          name: 'Coffee Table',
          description: 'Modern glass coffee table for living room',
          price: 75.00,
          imageUrl: '/sample-furniture-2.jpg',
          category: 'Furniture',
          condition: 'Excellent',
          seller: { name: 'Designer Diana' }
        },
        {
          id: 19,
          name: 'Bookshelf',
          description: 'Tall wooden bookshelf with 5 shelves',
          price: 60.00,
          imageUrl: '/sample-furniture-3.jpg',
          category: 'Furniture',
          condition: 'Good',
          seller: { name: 'Library Larry' }
        },
        {
          id: 20,
          name: 'Office Desk',
          description: 'Spacious office desk with drawers',
          price: 100.00,
          imageUrl: '/sample-furniture-4.jpg',
          category: 'Furniture',
          condition: 'Excellent',
          seller: { name: 'Office Oliver' }
        }
      ]
    };

    const products = fallbackProducts[categoryName] || [];
    return products.slice(0, size);
  }

  // Orphanage methods
  async getAllOrphanages(page = 0, size = 10) {
    try {
      // Use public endpoint for donation dashboard (no authentication required)
      return await this.publicRequest(`/orphanages/public?page=${page}&size=${size}`);
    } catch (error) {
      console.warn('Failed to fetch orphanages, using fallback data:', error);
      // Return fallback orphanages data
      return {
        content: [
          {
            id: 1,
            name: 'Hope Children\'s Home',
            description: 'A loving home for children in need, providing education and care.',
            location: 'Nairobi, Kenya',
            contactEmail: 'info@hopechildrenshome.org',
            contactPhone: '+254-700-123456',
            imageUrl: '/sample-orphanage-1.jpg',
            isApproved: true,
            totalDonationsReceived: 15000.00,
            childrenCount: 45
          },
          {
            id: 2,
            name: 'Sunshine Orphanage',
            description: 'Bringing sunshine to children\'s lives through love and education.',
            location: 'Mombasa, Kenya',
            contactEmail: 'contact@sunshineorphanage.org',
            contactPhone: '+254-700-789012',
            imageUrl: '/sample-orphanage-2.jpg',
            isApproved: true,
            totalDonationsReceived: 12000.00,
            childrenCount: 32
          },
          {
            id: 3,
            name: 'Little Angels Home',
            description: 'Providing a safe haven for orphaned and vulnerable children.',
            location: 'Kisumu, Kenya',
            contactEmail: 'info@littleangelshome.org',
            contactPhone: '+254-700-345678',
            imageUrl: '/sample-orphanage-3.jpg',
            isApproved: true,
            totalDonationsReceived: 8500.00,
            childrenCount: 28
          }
        ],
        totalElements: 3,
        totalPages: 1,
        number: page,
        size: size,
        first: true,
        last: true
      };
    }
  }

  async getAllOrphanagesForAdmin(page = 0, size = 10) {
    // Admin endpoint (requires authentication)
    return this.request(`/orphanages?page=${page}&size=${size}`);
  }

  async getOrphanage(id) {
    return this.request(`/orphanages/${id}`);
  }

  async approveOrphanage(id) {
    return this.request(`/orphanages/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectOrphanage(id) {
    return this.request(`/orphanages/${id}/reject`, {
      method: 'POST',
    });
  }

  async createOrphanage(orphanageData) {
    return this.request('/orphanages', {
      method: 'POST',
      body: JSON.stringify(orphanageData),
    });
  }

  // Orphanage donation management methods
  async getOrphanageDonations(orphanageId) {
    return this.request(`/donations/orphanage/${orphanageId}`);
  }

  async rejectDonation(donationId) {
    return this.request(`/donations/${donationId}/reject`, {
      method: 'POST',
    });
  }

  async completeDonation(donationId) {
    return this.request(`/donations/${donationId}/complete`, {
      method: 'POST',
    });
  }

  async getTotalCashDonationsForOrphanage(orphanageId) {
    return this.request(`/donations/total-cash/orphanage/${orphanageId}`);
  }

  // Admin methods
  async getAllClients(page = 0, size = 10) {
    return this.request(`/admin/clients?page=${page}&size=${size}`);
  }

  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  // Review methods
  async getAllReviews(page = 0, size = 10) {
    return this.request(`/reviews?page=${page}&size=${size}`);
  }

  async getProductReviews(productId, page = 0, size = 10) {
    return this.request(`/reviews/product/${productId}?page=${page}&size=${size}`);
  }

  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async approveReview(id) {
    return this.request(`/reviews/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectReview(id) {
    return this.request(`/reviews/${id}/reject`, {
      method: 'POST',
    });
  }

  // Payment methods
  async getAllPayments(page = 0, size = 10) {
    return this.request(`/payments?page=${page}&size=${size}`);
  }

  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async processMobileMoneyPayment(paymentData) {
    return this.request('/payments/mobile-money', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async confirmPayment(paymentId) {
    return this.request(`/payments/${paymentId}/confirm`, {
      method: 'POST',
    });
  }

  async cancelPayment(paymentId) {
    return this.request(`/payments/${paymentId}/cancel`, {
      method: 'POST',
    });
  }

  async getPaymentsByClient(clientId) {
    return this.request(`/payments/client/${clientId}`);
  }

  async getPaymentByOrder(orderId) {
    return this.request(`/payments/order/${orderId}`);
  }

  async getPaymentStats() {
    return this.request('/payments/stats');
  }

  // ===== IMAGE MANAGEMENT =====

  /**
   * Upload image file using multipart/form-data
   * @param {File} file - Image file to upload
   * @returns {Promise<Object>} - Upload result with imageId
   */
  async uploadImageFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/images/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload base64 image data
   * @param {string} base64Data - Base64 encoded image
   * @param {string} filename - Original filename
   * @param {string} contentType - MIME type
   * @returns {Promise<Object>} - Upload result with imageId
   */
  async uploadBase64Image(base64Data, filename = 'image.jpg', contentType = 'image/jpeg') {
    return this.request('/images/upload-base64', 'POST', {
      imageData: base64Data,
      filename: filename,
      contentType: contentType
    });
  }

  /**
   * Get image by ID
   * @param {string} imageId - Image ID
   * @returns {Promise<Blob>} - Image blob data
   */
  async getImage(imageId) {
    const response = await fetch(`${this.baseURL}/images/${imageId}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get image: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Get image info/metadata
   * @param {string} imageId - Image ID
   * @returns {Promise<Object>} - Image metadata
   */
  async getImageInfo(imageId) {
    return this.request(`/images/${imageId}/info`);
  }

  /**
   * Delete image by ID
   * @param {string} imageId - Image ID to delete
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteImage(imageId) {
    return this.request(`/images/${imageId}`, 'DELETE');
  }

  /**
   * Create product with new image system
   * @param {Object} productData - Product data including imageId
   * @returns {Promise<Object>} - Created product
   */
  async createProductWithImage(productData) {
    return this.request('/products', 'POST', productData);
  }
}

export default new ApiService();
