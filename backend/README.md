# DineMaster Backend

This backend consists of two Spring Boot microservices for the DineMaster Restaurant Management System.

## Services

### 1. Authentication Service (Port 8081)
- **Technology**: Spring Boot + MySQL + JWT
- **Purpose**: User authentication, JWT token generation, role-based access control
- **Database**: MySQL (dinemaster_auth)

### 2. Main Service (Port 8082)
- **Technology**: Spring Boot + MongoDB
- **Purpose**: Menu management, orders, reservations, locations, tables, offers, feedback, chef queue
- **Database**: MongoDB (dinemaster_main)

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- MongoDB 4.4+

## Setup Instructions

### 1. Database Setup

#### MySQL Setup
```sql
CREATE DATABASE dinemaster_auth;
```

#### MongoDB Setup
```bash
# MongoDB will automatically create the database on first connection
# Ensure MongoDB is running on localhost:27017
```

### 2. Configuration

#### Authentication Service Configuration
Edit `auth-service/src/main/resources/application.properties`:
```properties
# Update database credentials
spring.datasource.url=jdbc:mysql://localhost:3306/dinemaster_auth
spring.datasource.username=your_username
spring.datasource.password=your_password

# Update JWT secret (use a strong secret in production)
jwt.secret=your-strong-secret-key-here
```

#### Main Service Configuration
Edit `main-service/src/main/resources/application.properties`:
```properties
# Update MongoDB connection string if needed
spring.data.mongodb.uri=mongodb://localhost:27017/dinemaster_main
```

### 3. Build and Run

#### Authentication Service
```bash
cd auth-service
mvn clean install
mvn spring-boot:run
```

#### Main Service
```bash
cd main-service
mvn clean install
mvn spring-boot:run
```

## API Endpoints

### Authentication Service (http://localhost:8081)

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user/{email}` - Get user by email

### Main Service (http://localhost:8082)

#### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/{id}` - Get menu item by ID
- `POST /api/menu` - Create menu item
- `PUT /api/menu/{id}` - Update menu item
- `DELETE /api/menu/{id}` - Delete menu item

#### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/user/{userId}` - Get orders by user ID
- `POST /api/orders` - Create order
- `PUT /api/orders/{id}` - Update order
- `DELETE /api/orders/{id}` - Delete order

#### Reservations
- `GET /api/reservations` - Get all reservations
- `GET /api/reservations/{id}` - Get reservation by ID
- `GET /api/reservations/user/{userId}` - Get reservations by user ID
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/{id}` - Update reservation
- `DELETE /api/reservations/{id}` - Delete reservation

#### Locations
- `GET /api/locations` - Get all locations
- `GET /api/locations/{id}` - Get location by ID
- `POST /api/locations` - Create location
- `PUT /api/locations/{id}` - Update location
- `DELETE /api/locations/{id}` - Delete location

#### Tables
- `GET /api/tables` - Get all tables
- `GET /api/tables/{id}` - Get table by ID
- `GET /api/tables/branch/{branchId}` - Get tables by branch ID
- `POST /api/tables` - Create table
- `PUT /api/tables/{id}` - Update table
- `DELETE /api/tables/{id}` - Delete table

#### Offers
- `GET /api/offers` - Get all offers
- `GET /api/offers/active` - Get active offers
- `GET /api/offers/{id}` - Get offer by ID
- `POST /api/offers` - Create offer
- `PUT /api/offers/{id}` - Update offer
- `DELETE /api/offers/{id}` - Delete offer

#### Feedback
- `GET /api/feedback` - Get all feedback
- `GET /api/feedback/{id}` - Get feedback by ID
- `POST /api/feedback` - Create feedback
- `DELETE /api/feedback/{id}` - Delete feedback

#### Chef Queue
- `GET /api/chef-queue` - Get all chef queue items
- `GET /api/chef-queue/{id}` - Get chef queue item by ID
- `POST /api/chef-queue` - Create chef queue item
- `PUT /api/chef-queue/{id}` - Update chef queue item
- `DELETE /api/chef-queue/{id}` - Delete chef queue item

## Connecting with Frontend

### Update Frontend Configuration

In your React frontend, update the API base URLs:

```javascript
// Authentication Service
const AUTH_API_URL = 'http://localhost:8081/api/auth';

// Main Service
const MAIN_API_URL = 'http://localhost:8082/api';
```

### Example API Calls

#### Register User
```javascript
fetch('http://localhost:8081/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '1234567890',
    birthday: '1990-01-01'
  })
})
```

#### Login User
```javascript
fetch('http://localhost:8081/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123',
    role: 'customer'
  })
})
```

#### Get Menu Items
```javascript
fetch('http://localhost:8082/api/menu')
  .then(res => res.json())
  .then(data => console.log(data))
```

## CORS Configuration

Both services are configured to allow requests from:
- http://localhost:5173 (Vite default)
- http://localhost:3000 (React default)

To add more origins, update the `CorsConfigurationSource` in:
- `auth-service/src/main/java/com/dinemaster/auth/config/SecurityConfig.java`
- `main-service/src/main/java/com/dinemaster/main/config/CorsConfig.java`

## Deployment

### Docker Deployment (Optional)

Create a `Dockerfile` for each service:

#### Authentication Service Dockerfile
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/auth-service-1.0.0.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Main Service Dockerfile
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/main-service-1.0.0.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:
```bash
# Build services
cd auth-service && mvn clean package
cd ../main-service && mvn clean package

# Build Docker images
docker build -t dinemaster-auth-service ./auth-service
docker build -t dinemaster-main-service ./main-service

# Run containers
docker run -p 8081:8081 dinemaster-auth-service
docker run -p 8082:8082 dinemaster-main-service
```

## Troubleshooting

### Port Already in Use
If ports 8081 or 8082 are already in use, change the port in `application.properties`:
```properties
server.port=8083
```

### Database Connection Issues
- Ensure MySQL is running on port 3306
- Ensure MongoDB is running on port 27017
- Check database credentials in application.properties

### CORS Errors
- Verify frontend URL is in allowed origins list
- Check browser console for specific CORS errors

## Project Structure

```
backend/
├── auth-service/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/dinemaster/auth/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── model/
│   │   │   │   ├── repository/
│   │   │   │   ├── service/
│   │   │   │   ├── util/
│   │   │   │   └── AuthServiceApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
├── main-service/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/dinemaster/main/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── model/
│   │   │   │   ├── repository/
│   │   │   │   ├── service/
│   │   │   │   └── MainServiceApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
└── README.md
```

## Notes

- The lint errors shown in the IDE are expected because these are new files not yet part of a Maven project structure
- Once you run `mvn clean install` in each service directory, the errors will resolve
- The backend is designed to work with the existing React frontend
- JWT tokens are valid for 24 hours by default
- All passwords are encrypted using BCrypt
