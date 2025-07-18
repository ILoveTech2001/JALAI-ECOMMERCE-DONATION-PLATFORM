# Deployment Guide - Jalai Donation Platform

This guide covers deploying the Jalai Donation Platform backend to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Local Development](#local-development)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Production Considerations](#production-considerations)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

### System Requirements
- **Java**: 17 or higher
- **Maven**: 3.6 or higher
- **MySQL**: 8.0 or higher
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 10GB free space

### Development Tools
- IDE (IntelliJ IDEA, Eclipse, or VS Code)
- Git
- Docker (optional)
- Postman or similar API testing tool

## Environment Configuration

### 1. Environment Variables

Create environment-specific configuration files:

#### Development (`application-dev.properties`)
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/jalai_db_dev?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=dev_password

# JWT Configuration
jwt.secret=dev_secret_key_for_jalai_platform_2024
jwt.expiration=86400

# Logging
logging.level.com.example.jalai_backend=DEBUG
logging.level.org.springframework.security=DEBUG

# Server Configuration
server.port=8080
```

#### Staging (`application-staging.properties`)
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://staging-db:3306/jalai_db_staging?useSSL=true&serverTimezone=UTC
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JWT Configuration
jwt.secret=${JWT_SECRET}
jwt.expiration=86400

# Logging
logging.level.com.example.jalai_backend=INFO
logging.level.org.springframework.security=WARN

# Server Configuration
server.port=8080
```

#### Production (`application-prod.properties`)
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=true&serverTimezone=UTC
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# Connection Pool
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000

# JWT Configuration
jwt.secret=${JWT_SECRET}
jwt.expiration=86400

# Logging
logging.level.com.example.jalai_backend=WARN
logging.level.org.springframework.security=ERROR

# Server Configuration
server.port=8080

# Security
server.ssl.enabled=true
server.ssl.key-store=${SSL_KEYSTORE_PATH}
server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD}

# Session Configuration
spring.session.store-type=jdbc
spring.session.timeout=1800

# Actuator Security
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=when-authorized
```

### 2. Environment Variables Setup

Create a `.env` file for local development:
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=jalai_db
DB_USERNAME=jalai_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key_here_2024

# SSL (for production)
SSL_KEYSTORE_PATH=/path/to/keystore.p12
SSL_KEYSTORE_PASSWORD=keystore_password

# Email (if implementing email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# File Storage (if implementing file upload)
FILE_UPLOAD_DIR=/var/uploads
MAX_FILE_SIZE=10MB
```

## Local Development

### 1. Setup Database
```bash
# Start MySQL
sudo systemctl start mysql

# Create database
mysql -u root -p
CREATE DATABASE jalai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'jalai_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON jalai_db.* TO 'jalai_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Build and Run
```bash
# Clone repository
git clone <repository-url>
cd jalai-backend

# Build application
mvn clean compile

# Run tests
mvn test

# Run application
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 3. Verify Deployment
```bash
# Check health endpoint
curl http://localhost:8080/actuator/health

# Test API
curl http://localhost:8080/api/categories/public
```

## Docker Deployment

### 1. Create Dockerfile
```dockerfile
# Dockerfile
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src ./src

# Build application
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run application
CMD ["java", "-jar", "target/jalai-backend-0.0.1-SNAPSHOT.jar"]
```

### 2. Create Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: jalai-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: jalai_db
      MYSQL_USER: jalai_user
      MYSQL_PASSWORD: secure_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./scripts/setup-database.sql:/docker-entrypoint-initdb.d/setup.sql
    networks:
      - jalai-network

  backend:
    build: .
    container_name: jalai-backend
    environment:
      SPRING_PROFILES_ACTIVE: docker
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: jalai_db
      DB_USERNAME: jalai_user
      DB_PASSWORD: secure_password
      JWT_SECRET: docker_jwt_secret_key_2024
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    networks:
      - jalai-network
    volumes:
      - app_logs:/app/logs

volumes:
  mysql_data:
  app_logs:

networks:
  jalai-network:
    driver: bridge
```

### 3. Docker Commands
```bash
# Build and start services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Remove volumes (careful - this deletes data)
docker-compose down -v
```

## Cloud Deployment

### 1. AWS Deployment

#### Using AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init jalai-backend

# Create environment
eb create jalai-production

# Deploy
eb deploy

# Open application
eb open
```

#### Using AWS ECS with Fargate
```yaml
# task-definition.json
{
  "family": "jalai-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "jalai-backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/jalai-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_PROFILES_ACTIVE",
          "value": "prod"
        },
        {
          "name": "DB_HOST",
          "value": "your-rds-endpoint"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/jalai-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 2. Google Cloud Platform

#### Using Google Cloud Run
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/jalai-backend

# Deploy to Cloud Run
gcloud run deploy jalai-backend \
  --image gcr.io/PROJECT_ID/jalai-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="SPRING_PROFILES_ACTIVE=prod,DB_HOST=your-cloud-sql-ip"
```

### 3. Heroku Deployment

#### Create Heroku Configuration
```bash
# Create Heroku app
heroku create jalai-backend

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set SPRING_PROFILES_ACTIVE=prod
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Procfile
```
web: java -Dserver.port=$PORT -jar target/jalai-backend-0.0.1-SNAPSHOT.jar
```

## Production Considerations

### 1. Security Checklist
- [ ] Use HTTPS/SSL certificates
- [ ] Secure database connections
- [ ] Strong JWT secrets
- [ ] Input validation and sanitization
- [ ] Rate limiting implementation
- [ ] CORS configuration
- [ ] Security headers
- [ ] Regular security updates

### 2. Performance Optimization
```properties
# JVM Options
-Xms512m
-Xmx2g
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200

# Database Connection Pool
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000

# Caching
spring.cache.type=redis
spring.redis.host=redis-server
spring.redis.port=6379
```

### 3. Database Configuration
```sql
-- Production database optimizations
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 67108864; -- 64MB

-- Create indexes for performance
CREATE INDEX idx_products_search ON products(name, description);
CREATE INDEX idx_orders_date_status ON orders(created_at, status);
CREATE INDEX idx_donations_date_status ON donations(created_at, status);
```

### 4. Backup Strategy
```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="jalai_db"

# Create backup
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/jalai_db_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/jalai_db_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "jalai_db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: jalai_db_$DATE.sql.gz"
```

## Monitoring and Maintenance

### 1. Health Checks
```yaml
# Kubernetes health check example
livenessProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  initialDelaySeconds: 60
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /actuator/health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
```

### 2. Logging Configuration
```xml
<!-- logback-spring.xml -->
<configuration>
    <springProfile name="prod">
        <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>logs/jalai-backend.log</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
                <fileNamePattern>logs/jalai-backend.%d{yyyy-MM-dd}.%i.gz</fileNamePattern>
                <maxFileSize>100MB</maxFileSize>
                <maxHistory>30</maxHistory>
                <totalSizeCap>3GB</totalSizeCap>
            </rollingPolicy>
            <encoder>
                <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
            </encoder>
        </appender>
        
        <root level="WARN">
            <appender-ref ref="FILE" />
        </root>
    </springProfile>
</configuration>
```

### 3. Monitoring Setup
```properties
# Prometheus metrics
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.metrics.enabled=true
management.endpoint.prometheus.enabled=true
management.metrics.export.prometheus.enabled=true
```

### 4. Maintenance Scripts
```bash
#!/bin/bash
# maintenance.sh

echo "Starting maintenance tasks..."

# Update application
git pull origin main
mvn clean package -DskipTests

# Restart application
sudo systemctl restart jalai-backend

# Clean old logs
find /var/log/jalai-backend -name "*.log" -mtime +7 -delete

# Database maintenance
mysql -u $DB_USER -p$DB_PASSWORD -e "OPTIMIZE TABLE products, orders, donations;"

echo "Maintenance completed successfully"
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database connectivity
   mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SELECT 1"
   
   # Check application logs
   tail -f logs/jalai-backend.log | grep -i "database\|connection"
   ```

2. **Memory Issues**
   ```bash
   # Monitor memory usage
   free -h
   
   # Check Java heap usage
   jstat -gc <java_process_id>
   
   # Adjust JVM settings
   export JAVA_OPTS="-Xms1g -Xmx2g"
   ```

3. **Performance Issues**
   ```bash
   # Monitor application metrics
   curl http://localhost:8080/actuator/metrics
   
   # Check database performance
   mysql -e "SHOW PROCESSLIST;"
   mysql -e "SHOW ENGINE INNODB STATUS;"
   ```

### Support Contacts
- **Development Team**: dev-team@jalai.com
- **DevOps Team**: devops@jalai.com
- **Emergency**: +1-XXX-XXX-XXXX

For detailed troubleshooting, check the application logs and refer to the monitoring dashboards.
