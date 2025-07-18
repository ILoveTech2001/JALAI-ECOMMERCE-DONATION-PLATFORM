# Frontend Integration Guide

This guide explains how to integrate your frontend application with the Jalai Donation Platform backend APIs.

## Table of Contents

1. [API Base Configuration](#api-base-configuration)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Code Examples](#code-examples)
6. [Best Practices](#best-practices)

## API Base Configuration

### Base URL
```
Development: http://localhost:8080/api
Production: https://your-domain.com/api
```

### Headers
All API requests should include:
```javascript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

For authenticated requests, also include:
```javascript
{
  'Authorization': 'Bearer <access_token>'
}
```

## Authentication

### 1. User Registration

#### Register Client
```javascript
POST /auth/register/client
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "location": "New York, NY"
}
```

#### Register Orphanage
```javascript
POST /auth/register/orphanage
{
  "name": "Hope Children Home",
  "email": "hope@orphanage.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1234567890",
  "location": "123 Hope Street, City"
}
```

### 2. User Login
```javascript
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```javascript
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "userType": "CLIENT",
    "isActive": true
  }
}
```

### 3. Token Management

#### Refresh Token
```javascript
POST /auth/refresh
{
  "refreshToken": "your_refresh_token"
}
```

#### Logout
```javascript
POST /auth/logout
```

## API Endpoints

### Products

#### Get All Products (with pagination)
```javascript
GET /products?page=0&size=10
```

#### Get Product by ID
```javascript
GET /products/{id}
```

#### Search Products
```javascript
GET /products/search?keyword=phone
```

#### Get Products by Category
```javascript
GET /products/category/{categoryId}?page=0&size=10
```

#### Create Product (Client only)
```javascript
POST /products
{
  "name": "iPhone 12",
  "description": "Excellent condition iPhone 12",
  "price": 599.99,
  "imageUrl": "http://example.com/image.jpg",
  "sellerId": "seller_uuid",
  "categoryId": "category_uuid"
}
```

#### Update Product
```javascript
PUT /products/{id}
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "price": 699.99
}
```

### Cart Management

#### Get Cart Items
```javascript
GET /cart/{clientId}
```

#### Add to Cart
```javascript
POST /cart/add
{
  "clientId": "client_uuid",
  "productId": "product_uuid",
  "quantity": 1
}
```

#### Update Cart Item
```javascript
PUT /cart/update
{
  "clientId": "client_uuid",
  "productId": "product_uuid",
  "quantity": 2
}
```

#### Remove from Cart
```javascript
DELETE /cart/remove?clientId={clientId}&productId={productId}
```

#### Get Cart Total
```javascript
GET /cart/total/{clientId}
```

### Orders

#### Create Order from Cart
```javascript
POST /orders/create-from-cart
{
  "clientId": "client_uuid",
  "deliveryDate": "2024-01-15T10:00:00"
}
```

#### Get Orders by Client
```javascript
GET /orders/client/{clientId}?page=0&size=10
```

#### Track Order
```javascript
GET /orders/track/{orderId}
```

#### Update Order Status
```javascript
PUT /orders/{orderId}/status?status=CONFIRMED
```

### Donations

#### Create Donation
```javascript
POST /donations
{
  "clientId": "client_uuid",
  "orphanageId": "orphanage_uuid",
  "donationType": "CASH",
  "appointmentDate": "2024-01-20T14:00:00",
  "cashAmount": 500.00,
  "itemDescription": null
}
```

#### Get Donations by Client
```javascript
GET /donations/client/{clientId}
```

#### Get Donations by Orphanage
```javascript
GET /donations/orphanage/{orphanageId}
```

#### Confirm Donation (Orphanage/Admin)
```javascript
POST /donations/{id}/confirm
```

### Categories

#### Get All Active Categories
```javascript
GET /categories/public
```

#### Get Category Details
```javascript
GET /categories/{id}
```

## Error Handling

### Standard Error Response Format
```javascript
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "path": "/api/products",
  "validationErrors": {
    "name": "Product name is required",
    "price": "Price must be greater than 0"
  }
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

## Code Examples

### JavaScript/React Example

#### API Service Setup
```javascript
// apiService.js
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      return await response.json();
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
    }
    
    return response;
  }

  async register(userData, userType = 'client') {
    return this.request(`/auth/register/${userType}`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Product methods
  async getProducts(page = 0, size = 10) {
    return this.request(`/products?page=${page}&size=${size}`);
  }

  async searchProducts(keyword) {
    return this.request(`/products/search?keyword=${encodeURIComponent(keyword)}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
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

  // Order methods
  async createOrderFromCart(clientId, deliveryDate) {
    return this.request('/orders/create-from-cart', {
      method: 'POST',
      body: JSON.stringify({ clientId, deliveryDate }),
    });
  }

  async getOrders(clientId, page = 0, size = 10) {
    return this.request(`/orders/client/${clientId}?page=${page}&size=${size}`);
  }

  // Donation methods
  async createDonation(donationData) {
    return this.request('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  async getDonations(clientId) {
    return this.request(`/donations/client/${clientId}`);
  }
}

export default new ApiService();
```

#### React Hook for Authentication
```javascript
// useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import apiService from './apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      apiService.setToken(token);
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password);
      setUser(response.user);
      localStorage.setItem('userData', JSON.stringify(response.user));
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    apiService.clearToken();
    localStorage.removeItem('userData');
  };

  const register = async (userData, userType) => {
    try {
      const response = await apiService.register(userData, userType);
      setUser(response.user);
      localStorage.setItem('userData', JSON.stringify(response.user));
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Best Practices

### 1. Token Management
- Store tokens securely (consider using httpOnly cookies for production)
- Implement automatic token refresh
- Clear tokens on logout
- Handle token expiration gracefully

### 2. Error Handling
- Implement global error handling
- Show user-friendly error messages
- Log errors for debugging
- Handle network failures

### 3. Loading States
- Show loading indicators during API calls
- Implement skeleton screens for better UX
- Handle slow network connections

### 4. Caching
- Cache frequently accessed data
- Implement proper cache invalidation
- Use React Query or SWR for data fetching

### 5. Security
- Validate all user inputs on frontend
- Sanitize data before displaying
- Use HTTPS in production
- Implement proper CORS configuration

### 6. Performance
- Implement pagination for large datasets
- Use debouncing for search inputs
- Optimize image loading
- Minimize API calls

### 7. User Experience
- Provide immediate feedback for user actions
- Implement optimistic updates where appropriate
- Handle offline scenarios
- Ensure responsive design

## Testing Frontend Integration

### 1. API Testing Tools
- Use Postman or Insomnia for manual API testing
- Test all endpoints with different scenarios
- Verify error responses

### 2. Frontend Testing
- Write unit tests for API service functions
- Test authentication flows
- Mock API responses for testing
- Test error handling scenarios

### 3. Integration Testing
- Test complete user workflows
- Verify data consistency
- Test with real backend
- Performance testing under load

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured correctly
   - Check allowed origins and methods

2. **Authentication Issues**
   - Verify token format and expiration
   - Check authorization headers
   - Ensure proper role-based access

3. **Network Errors**
   - Check network connectivity
   - Verify API endpoints are accessible
   - Check for firewall issues

4. **Data Format Issues**
   - Ensure request/response formats match API specification
   - Validate JSON structure
   - Check data types and required fields

For more detailed API documentation, refer to the Swagger/OpenAPI documentation available at `/swagger-ui.html` when the backend is running.
