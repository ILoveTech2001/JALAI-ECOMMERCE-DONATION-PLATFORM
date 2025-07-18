# Jalai Donation Platform - API Documentation

## Overview

The Jalai Donation Platform provides a comprehensive REST API for managing a donation and marketplace platform. The API supports multiple user types (Clients, Admins, Orphanages) with role-based access control.

## Base Information

- **Base URL**: `http://localhost:8080/api`
- **Authentication**: JWT Bearer Token
- **Content Type**: `application/json`
- **API Version**: v1.0

## Authentication Endpoints

### POST /auth/login
Authenticate user and receive access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "userType": "CLIENT|ADMIN|ORPHANAGE",
    "isActive": true
  }
}
```

### POST /auth/register/client
Register a new client user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "location": "New York, NY"
}
```

### POST /auth/register/orphanage
Register a new orphanage.

**Request Body:**
```json
{
  "name": "Hope Children Home",
  "email": "hope@orphanage.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1234567890",
  "location": "123 Hope Street"
}
```

### POST /auth/refresh
Refresh access token using refresh token.

### POST /auth/logout
Logout user (invalidate tokens).

## Product Endpoints

### GET /products
Get all available products with pagination.

**Query Parameters:**
- `page` (int): Page number (default: 0)
- `size` (int): Page size (default: 10)

**Response:**
```json
{
  "content": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "imageUrl": "http://example.com/image.jpg",
      "isAvailable": true,
      "isApproved": true,
      "isDonated": false,
      "seller": {
        "id": "uuid",
        "name": "Seller Name"
      },
      "category": {
        "id": "uuid",
        "name": "Category Name"
      }
    }
  ],
  "totalElements": 100,
  "totalPages": 10,
  "size": 10,
  "number": 0
}
```

### GET /products/{id}
Get product by ID.

### POST /products
Create a new product (Client role required).

**Request Body:**
```json
{
  "name": "iPhone 12",
  "description": "Excellent condition",
  "price": 599.99,
  "imageUrl": "http://example.com/image.jpg",
  "sellerId": "seller_uuid",
  "categoryId": "category_uuid"
}
```

### PUT /products/{id}
Update product (Owner or Admin required).

### DELETE /products/{id}
Delete product (Owner or Admin required).

### GET /products/search
Search products by keyword.

**Query Parameters:**
- `keyword` (string): Search keyword

### GET /products/category/{categoryId}
Get products by category with pagination.

### POST /products/{id}/approve
Approve product (Admin role required).

### POST /products/{id}/reject
Reject product (Admin role required).

## Cart Endpoints

### GET /cart/{clientId}
Get cart items for a client.

### POST /cart/add
Add item to cart.

**Request Body:**
```json
{
  "clientId": "uuid",
  "productId": "uuid",
  "quantity": 1
}
```

### PUT /cart/update
Update cart item quantity.

### DELETE /cart/remove
Remove item from cart.

**Query Parameters:**
- `clientId` (uuid): Client ID
- `productId` (uuid): Product ID

### DELETE /cart/clear/{clientId}
Clear all items from cart.

### GET /cart/total/{clientId}
Get cart total amount.

## Order Endpoints

### GET /orders
Get all orders (Admin role required).

### GET /orders/{id}
Get order by ID.

### GET /orders/client/{clientId}
Get orders by client with pagination.

### POST /orders/create-from-cart
Create order from cart items.

**Request Body:**
```json
{
  "clientId": "uuid",
  "deliveryDate": "2024-01-15T10:00:00"
}
```

### PUT /orders/{id}/status
Update order status.

**Query Parameters:**
- `status`: Order status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)

### POST /orders/{id}/cancel
Cancel order.

### GET /orders/track/{id}
Track order status.

## Donation Endpoints

### GET /donations
Get all donations (Admin role required).

### GET /donations/{id}
Get donation by ID.

### GET /donations/client/{clientId}
Get donations by client.

### GET /donations/orphanage/{orphanageId}
Get donations by orphanage.

### POST /donations
Create a new donation.

**Request Body:**
```json
{
  "clientId": "uuid",
  "orphanageId": "uuid",
  "donationType": "CASH|KIND|BOTH",
  "appointmentDate": "2024-01-20T14:00:00",
  "cashAmount": 500.00,
  "itemDescription": "Books and toys"
}
```

### POST /donations/{id}/confirm
Confirm donation (Orphanage or Admin role required).

### POST /donations/{id}/complete
Complete donation (Orphanage or Admin role required).

### POST /donations/{id}/cancel
Cancel donation.

## Client Endpoints

### GET /client/profile/{id}
Get client profile.

### PUT /client/profile/{id}
Update client profile.

### PUT /client/password/{id}
Update client password.

### GET /client/orders/{id}
Get client orders.

### GET /client/donations/{id}
Get client donations.

## Category Endpoints

### GET /categories/public
Get all active categories (public access).

### GET /categories/{id}
Get category by ID.

### POST /categories
Create category (Admin role required).

### PUT /categories/{id}
Update category (Admin role required).

### DELETE /categories/{id}
Delete category (Admin role required).

## Error Responses

All endpoints return standardized error responses:

```json
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

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- General endpoints: 100 requests per minute
- File upload endpoints: 10 requests per minute

## Data Models

### User Types
- **CLIENT**: Regular users who can buy, sell, and donate
- **ADMIN**: System administrators with full access
- **ORPHANAGE**: Orphanage organizations that receive donations

### Order Status
- **PENDING**: Order created, awaiting confirmation
- **CONFIRMED**: Order confirmed by seller
- **PROCESSING**: Order being prepared
- **SHIPPED**: Order shipped to customer
- **DELIVERED**: Order delivered successfully
- **CANCELLED**: Order cancelled
- **REFUNDED**: Order refunded

### Donation Types
- **CASH**: Monetary donation
- **KIND**: Item donation
- **BOTH**: Both cash and items

### Donation Status
- **PENDING**: Donation request submitted
- **CONFIRMED**: Donation confirmed by orphanage
- **IN_PROGRESS**: Donation in progress
- **COMPLETED**: Donation completed
- **CANCELLED**: Donation cancelled

## Security

### Authentication
- JWT tokens with 24-hour expiration
- Refresh tokens with 7-day expiration
- Role-based access control

### Authorization
- Endpoint-level security with role requirements
- Resource-level security (users can only access their own data)
- Admin override for management operations

### Data Protection
- Password encryption using BCrypt
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## Testing

### Test Credentials
**Admin:**
- Email: `admin@jalai.com`
- Password: `Admin123!`

**Sample Client:**
- Email: `john.doe@email.com`
- Password: `Client123!`

**Sample Orphanage:**
- Email: `hope@orphanage.com`
- Password: `Orphan123!`

## Support

For API support and questions:
- Documentation: This file and inline API docs
- Issues: Create GitHub issues for bugs
- Contact: Backend development team

## Changelog

### v1.0 (Current)
- Initial API release
- Authentication and authorization
- Product management
- Cart and order functionality
- Donation system
- User management
