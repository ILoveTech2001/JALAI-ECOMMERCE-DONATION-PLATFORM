// API Service for JALAI Donation Platform
class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:8080/api';
    this.token = localStorage.getItem('accessToken');
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
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
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
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return response;
    } catch (error) {
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
    
    if (response.accessToken) {
      this.setToken(response.accessToken);
      localStorage.setItem('userData', JSON.stringify(response.user));
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  }

  async register(userData, userType = 'client') {
    const response = await this.request(`/auth/register/${userType}`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.accessToken) {
      this.setToken(response.accessToken);
      localStorage.setItem('userData', JSON.stringify(response.user));
      localStorage.setItem('refreshToken', response.refreshToken);
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

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
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

  async approveProduct(id) {
    return this.request(`/products/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectProduct(id) {
    return this.request(`/products/${id}/reject`, {
      method: 'POST',
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

  async getCartTotal(clientId) {
    return this.request(`/cart/total/${clientId}`);
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
    return this.request('/orders/create-from-cart', {
      method: 'POST',
      body: JSON.stringify({ clientId, deliveryDate }),
    });
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/orders/${orderId}/status?status=${status}`, {
      method: 'PUT',
    });
  }

  async cancelOrder(orderId) {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'POST',
    });
  }

  async trackOrder(orderId) {
    return this.request(`/orders/track/${orderId}`);
  }

  // Donation methods
  async getAllDonations(page = 0, size = 10) {
    return this.request(`/donations?page=${page}&size=${size}`);
  }

  async getDonation(id) {
    return this.request(`/donations/${id}`);
  }

  async getDonationsByClient(clientId) {
    return this.request(`/donations/client/${clientId}`);
  }

  async getDonationsByOrphanage(orphanageId) {
    return this.request(`/donations/orphanage/${orphanageId}`);
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

  async completeDonation(id) {
    return this.request(`/donations/${id}/complete`, {
      method: 'POST',
    });
  }

  async cancelDonation(id) {
    return this.request(`/donations/${id}/cancel`, {
      method: 'POST',
    });
  }

  // Client methods
  async getClientProfile(id) {
    return this.request(`/client/profile/${id}`);
  }

  async updateClientProfile(id, profileData) {
    return this.request(`/client/profile/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateClientPassword(id, passwordData) {
    return this.request(`/client/password/${id}`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async getClientOrders(id) {
    return this.request(`/client/orders/${id}`);
  }

  async getClientDonations(id) {
    return this.request(`/client/donations/${id}`);
  }

  // Category methods
  async getCategories() {
    return this.request('/categories/public');
  }

  async getCategory(id) {
    return this.request(`/categories/${id}`);
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
    return this.request(`/orphanages?page=${page}&size=${size}`);
  }

  async getOrphanage(id) {
    return this.request(`/orphanages/${id}`);
  }

  async getOrphanageProfile(id) {
    return this.request(`/orphanage/profile/${id}`);
  }

  async updateOrphanageProfile(id, profileData) {
    return this.request(`/orphanage/profile/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
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

  async getOrphanageDonations(id) {
    return this.request(`/orphanage/donations/${id}`);
  }

  // Admin methods
  async getAllClients(page = 0, size = 10) {
    return this.request(`/admin/clients?page=${page}&size=${size}`);
  }

  async getClient(id) {
    return this.request(`/admin/clients/${id}`);
  }

  async updateClientStatus(id, status) {
    return this.request(`/admin/clients/${id}/status?status=${status}`, {
      method: 'PUT',
    });
  }

  async deleteClient(id) {
    return this.request(`/admin/clients/${id}`, {
      method: 'DELETE',
    });
  }

  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  async getRecentActivity() {
    return this.request('/admin/dashboard/recent-activity');
  }

  // Review methods
  async getAllReviews(page = 0, size = 10) {
    return this.request(`/reviews?page=${page}&size=${size}`);
  }

  async getReview(id) {
    return this.request(`/reviews/${id}`);
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

  async updateReview(id, reviewData) {
    return this.request(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(id) {
    return this.request(`/reviews/${id}`, {
      method: 'DELETE',
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

  async getPayment(id) {
    return this.request(`/payments/${id}`);
  }

  async getPaymentsByClient(clientId) {
    return this.request(`/payments/client/${clientId}`);
  }

  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async updatePaymentStatus(id, status) {
    return this.request(`/payments/${id}/status?status=${status}`, {
      method: 'PUT',
    });
  }

  // File upload methods
  async uploadFile(file, type = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/files/upload', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }

  async uploadMultipleFiles(files, type = 'general') {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    formData.append('type', type);

    return this.request('/files/upload-multiple', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }

  // Search methods
  async globalSearch(query, page = 0, size = 10) {
    return this.request(`/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
  }

  async searchOrphanages(query, page = 0, size = 10) {
    return this.request(`/orphanages/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
  }

  // Statistics methods
  async getProductStats() {
    return this.request('/admin/stats/products');
  }

  async getOrderStats() {
    return this.request('/admin/stats/orders');
  }

  async getDonationStats() {
    return this.request('/admin/stats/donations');
  }

  async getUserStats() {
    return this.request('/admin/stats/users');
  }
}

export default new ApiService();
