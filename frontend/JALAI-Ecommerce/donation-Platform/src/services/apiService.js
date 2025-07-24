// API Service for JALAI Donation Platform
class ApiService {
  constructor() {
    // Use environment variable for production, fallback to localhost for development
    // Support both Vite (VITE_) and Create React App (REACT_APP_) environment variables
    this.baseURL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'https://jalai-ecommerce-donation-platform-3.onrender.com/api';
    this.token = localStorage.getItem('accessToken') || localStorage.getItem('adminToken');
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

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Get the current token (either user or admin)
    const currentToken = this.token || localStorage.getItem('accessToken') || localStorage.getItem('adminToken');

    // Debug authentication for order creation
    if (endpoint.includes('orders/create-from-cart')) {
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
      console.log(`Making API request to: ${url}`); // Debug log
      if (endpoint.includes('orders/create-from-cart')) {
        console.log('Request headers:', config.headers);
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
          // If refresh failed, clear tokens and redirect to login
          this.clearToken();
          window.location.href = '/login';
          return;
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
        throw new Error(errorMessage);
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
        throw new Error(`Unable to connect to server. Please check if the backend is running on ${this.baseURL}`);
      }
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    console.log('API login response:', response); // Debug log

    if (response && response.accessToken) {
      this.setToken(response.accessToken);
      if (response.user) {
        localStorage.setItem('userData', JSON.stringify(response.user));
      }
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
    } else {
      console.error('Login response missing accessToken:', response);
    }

    return response;
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
    return this.request(`/products?page=${page}&size=${size}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async searchProducts(keyword, page = 0, size = 10) {
    return this.request(`/products/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
  }

  async getProductsByCategory(categoryId, page = 0, size = 10) {
    return this.request(`/products/category/${categoryId}?page=${page}&size=${size}`);
  }

  async getApprovedProducts(page = 0, size = 10) {
    return this.request(`/products/approved?page=${page}&size=${size}`);
  }

  async getApprovedProductsByCategory(categoryName, page = 0, size = 4) {
    return this.request(`/products/approved/category/${encodeURIComponent(categoryName)}?page=${page}&size=${size}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
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
    return this.request(`/products/client/${clientId}`);
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
    return this.request('/categories/public');
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

  // Orphanage methods
  async getAllOrphanages(page = 0, size = 10) {
    // Use public endpoint for donation dashboard (no authentication required)
    return this.request(`/orphanages/public?page=${page}&size=${size}`);
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
}

export default new ApiService();
