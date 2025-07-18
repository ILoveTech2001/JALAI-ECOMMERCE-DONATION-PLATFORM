# Jalai Donation Platform - Backend

A comprehensive Spring Boot backend for a donation and marketplace platform that connects donors with orphanages and facilitates buying/selling of items.

## 🌟 Features

### Core Functionality
- **Multi-User System**: Supports Clients, Admins, and Orphanages with role-based access
- **Marketplace**: Buy and sell items with approval workflow
- **Donation System**: Cash and kind donations to orphanages
- **Order Management**: Complete order lifecycle with tracking
- **Payment Integration**: Multiple payment methods support
- **Review System**: Product reviews and ratings

### Technical Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: Fine-grained access control
- **Database Migrations**: Flyway-managed schema evolution
- **Comprehensive Validation**: Input validation and error handling
- **Session Management**: Spring Session with database storage
- **API Documentation**: RESTful API with comprehensive docs

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.6+
- MySQL 8.0+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jalai-backend
   ```

2. **Setup database**
   ```bash
   mysql -u root -p
   CREATE DATABASE jalai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Configure application**
   ```bash
   cp src/main/resources/application.properties.example src/main/resources/application.properties
   # Edit database credentials and other settings
   ```

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

5. **Verify installation**
   ```bash
   curl http://localhost:8080/actuator/health
   ```

## 📁 Project Structure

```
jalai-backend/
├── src/main/java/com/example/jalai_backend/
│   ├── controller/          # REST controllers
│   ├── service/            # Business logic
│   ├── repository/         # Data access layer
│   ├── model/              # Entity classes
│   ├── security/           # Security configuration
│   ├── exception/          # Custom exceptions
│   ├── validation/         # Custom validators
│   ├── dto/                # Data transfer objects
│   └── config/             # Configuration classes
├── src/main/resources/
│   ├── db/migration/       # Flyway migration scripts
│   └── application.properties
├── src/test/               # Test classes
├── scripts/                # Utility scripts
└── docs/                   # Documentation
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=jalai_db
DB_USERNAME=jalai_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
SERVER_PORT=8080
```

### Application Profiles
- **dev**: Development environment
- **test**: Testing environment
- **prod**: Production environment

## 📊 Database Schema

### Core Entities
- **Users**: Admins, Clients, Orphanages
- **Products**: Items for sale/donation
- **Categories**: Product categorization
- **Orders**: Purchase transactions
- **Donations**: Donation records
- **Cart**: Shopping cart items
- **Reviews**: Product reviews
- **Payments**: Payment transactions

### Relationships
- One-to-Many: Client → Products, Orders, Donations
- Many-to-One: Product → Category, Seller
- One-to-One: Order → Payment

## 🔐 Authentication & Authorization

### User Roles
- **CLIENT**: Can buy, sell, and donate items
- **ADMIN**: Full system access and management
- **ORPHANAGE**: Can receive donations and manage profile

### JWT Token Structure
```json
{
  "sub": "user@example.com",
  "userId": "uuid",
  "userType": "CLIENT",
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Protected Endpoints
- `/api/admin/**` - Admin only
- `/api/client/**` - Client only
- `/api/orphanage/**` - Orphanage only
- `/api/cart/**` - Authenticated users
- `/api/orders/**` - Authenticated users

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/login              # User login
POST /api/auth/register/client    # Client registration
POST /api/auth/register/orphanage # Orphanage registration
POST /api/auth/refresh            # Token refresh
POST /api/auth/logout             # User logout
```

### Products
```
GET    /api/products              # Get all products
GET    /api/products/{id}         # Get product by ID
POST   /api/products              # Create product
PUT    /api/products/{id}         # Update product
DELETE /api/products/{id}         # Delete product
GET    /api/products/search       # Search products
```

### Cart & Orders
```
GET    /api/cart/{clientId}       # Get cart items
POST   /api/cart/add              # Add to cart
POST   /api/orders/create-from-cart # Create order
GET    /api/orders/client/{id}    # Get client orders
```

### Donations
```
POST   /api/donations             # Create donation
GET    /api/donations/client/{id} # Get client donations
POST   /api/donations/{id}/confirm # Confirm donation
```

## 🧪 Testing

### Run Tests
```bash
# All tests
mvn test

# Specific test class
mvn test -Dtest=AuthServiceTest

# With coverage
mvn test jacoco:report
```

### Test Data
The application includes sample data for testing:
- **Admin**: admin@jalai.com / Admin123!
- **Client**: john.doe@email.com / Client123!
- **Orphanage**: hope@orphanage.com / Orphan123!

## 🚀 Deployment

### Docker
```bash
# Build and run with Docker Compose
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Platforms
- **AWS**: Elastic Beanstalk, ECS, or EC2
- **Google Cloud**: Cloud Run or Compute Engine
- **Heroku**: Direct deployment support

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📚 Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Frontend Integration Guide](FRONTEND_INTEGRATION_GUIDE.md) - Frontend integration
- [Database Setup](DATABASE_SETUP.md) - Database configuration
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Deployment instructions

## 🔍 Monitoring

### Health Checks
```bash
# Application health
curl http://localhost:8080/actuator/health

# Metrics
curl http://localhost:8080/actuator/metrics
```

### Logging
- **Development**: Console and file logging
- **Production**: Structured logging with log rotation
- **Monitoring**: Integration with ELK stack or similar

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Java coding standards
- Write comprehensive tests
- Update documentation
- Use conventional commit messages

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL is running
   - Verify credentials in application.properties
   - Ensure database exists

2. **Port Already in Use**
   ```bash
   # Find process using port 8080
   lsof -i :8080
   # Kill the process
   kill -9 <PID>
   ```

3. **JWT Token Issues**
   - Check token expiration
   - Verify JWT secret configuration
   - Ensure proper Authorization header format

### Getting Help
- Check the [Issues](../../issues) page
- Review [API Documentation](API_DOCUMENTATION.md)
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Development**: Spring Boot, MySQL, Security
- **DevOps**: Docker, CI/CD, Cloud deployment
- **Testing**: Unit tests, Integration tests, API testing

## 🙏 Acknowledgments

- Spring Boot community for excellent framework
- MySQL for reliable database solution
- JWT.io for token implementation guidance
- All contributors and testers

---

**Made with ❤️ for connecting donors with those in need**
