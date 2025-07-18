# Database Setup Guide

This guide explains how to set up the database for the Jalai Donation Platform.

## Prerequisites

- MySQL 8.0 or higher
- MySQL client or MySQL Workbench
- Java 17 or higher
- Maven 3.6 or higher

## Database Setup

### 1. Create Database

Run the database setup script:

```sql
-- Connect to MySQL as root or admin user
mysql -u root -p

-- Run the setup script
source scripts/setup-database.sql
```

Or manually create the database:

```sql
CREATE DATABASE IF NOT EXISTS jalai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Application

Update `src/main/resources/application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/jalai_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_password
```

### 3. Run Migrations

The application uses Flyway for database migrations. When you start the application, it will automatically:

1. Create all necessary tables
2. Insert initial data (admin user, sample categories, etc.)

To run the application:

```bash
mvn spring-boot:run
```

## Database Schema

### Tables Created

1. **admins** - System administrators
2. **clients** - Regular users (buyers/sellers)
3. **orphanages** - Orphanage organizations
4. **categories** - Product categories
5. **products** - Items for sale/donation
6. **cart** - Shopping cart items
7. **orders** - Purchase orders
8. **payments** - Payment transactions
9. **reviews** - Product reviews
10. **donations** - Donation records
11. **SPRING_SESSION** - Session management tables

### Initial Data

The migration scripts will create:

- **Default Admin User**
  - Email: `admin@jalai.com`
  - Password: `Admin123!`

- **Sample Categories**
  - Electronics, Clothing, Books, Toys, Furniture, Sports, Kitchen, Health

- **Sample Orphanages**
  - Hope Children Home
  - Sunshine Orphanage
  - Little Angels Home
  - Rainbow Children Center

- **Sample Users**
  - John Doe, Jane Smith, Mike Johnson, Sarah Wilson, David Brown
  - All with password: `Client123!`

## Database Management

### Reset Database

To completely reset the database:

```sql
source scripts/cleanup-database.sql
```

Then restart the application to recreate tables and data.

### Manual Migration

If you need to run migrations manually:

```bash
mvn flyway:migrate
```

### Check Migration Status

```bash
mvn flyway:info
```

### Validate Migrations

```bash
mvn flyway:validate
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MySQL is running
   - Check host, port, username, and password
   - Verify database exists

2. **Migration Failures**
   - Check Flyway migration files for syntax errors
   - Ensure database user has sufficient privileges
   - Review application logs for detailed error messages

3. **Character Encoding Issues**
   - Ensure database uses `utf8mb4` character set
   - Check connection URL includes proper encoding parameters

### Useful Commands

```sql
-- Check database character set
SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'jalai_db';

-- Show all tables
SHOW TABLES;

-- Check table structure
DESCRIBE table_name;

-- View migration history
SELECT * FROM flyway_schema_history;
```

## Production Considerations

For production deployment:

1. **Create dedicated database user**:
   ```sql
   CREATE USER 'jalai_user'@'%' IDENTIFIED BY 'secure_password';
   GRANT SELECT, INSERT, UPDATE, DELETE ON jalai_db.* TO 'jalai_user'@'%';
   FLUSH PRIVILEGES;
   ```

2. **Enable SSL connections**
3. **Set up database backups**
4. **Configure connection pooling**
5. **Monitor database performance**

## Security Notes

- Change default passwords before production deployment
- Use environment variables for database credentials
- Enable SSL for database connections in production
- Regularly update and patch MySQL server
- Implement proper backup and recovery procedures
