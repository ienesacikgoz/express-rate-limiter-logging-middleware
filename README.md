# Express.js Production Starter with Rate Limiting & Structured Logging

[📖 English](./README.md) | [🇹🇷 Türkçe](./README_TR.md)

> A reusable Express application template demonstrating production-ready patterns for rate limiting, structured logging, and security.

A fully-configured Express.js application template featuring advanced rate limiting (IP-based and user-aware), structured logging with correlation IDs, JWT authentication, security headers, and comprehensive error handling. Use this as a foundation for building scalable APIs with built-in observability and security best practices.

## ✨ Features

- **Advanced Rate Limiting**: IP-based and user-based limiting with customizable strategies
- **Structured Logging**: Winston logger with colored console output and file persistence
- **Request Correlation IDs**: Unique request tracking for distributed tracing
- **Security Headers**: Helmet.js integration for HTTP security
- **JWT Authentication**: Token-based user authentication with expiry
- **Custom Error Handling**: Centralized error handling with consistent responses
- **CORS Support**: Configurable cross-origin resource sharing
- **Health Checks**: `/health` and `/ready` endpoints for orchestration
- **Request Timing**: Automatic response time tracking
- **User-Aware Logging**: All logs include user context when authenticated
- **Graceful Shutdown**: Proper signal handling and cleanup

## 📚 Documentation

- **[Quick Start](./docs/QUICKSTART.md)** — Get running in 3 minutes
- **[Architecture](./docs/ARCHITECTURE.md)** — Design patterns and system architecture
- **[Deployment](./docs/DEPLOYMENT.md)** — Production deployment guide (Docker, Kubernetes, Cloud)
- **[Contributing](./docs/CONTRIBUTING.md)** — How to contribute to this project

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 18+ |
| Framework | Express | v4.18+ |
| Rate Limiting | express-rate-limit | v7.1+ |
| Security | Helmet.js | v7.1+ |
| Logging | Winston | v3.11+ |
| Authentication | JWT | jsonwebtoken v9+ |
| Password Hashing | bcryptjs | v2.4+ |
| Utilities | UUID | v9.0+ |
| **Testing** | **Jest** | **v29.7+** |

## 🏗️ Architecture Overview

```
Request
  ↓
Helmet (Security Headers)
  ↓
CORS
  ↓
Request ID Middleware (Correlation Tracking)
  ↓
Rate Limiter (IP/User-based)
  ↓
Auth Routes / Protected Routes
  ↓
Auth Middleware (for protected routes)
  ↓
Controllers (Business Logic)
  ↓
Error Handler
  ↓
Response with Request ID
```

## 🔐 Security Measures

**Security measures:** JWT rotation, Helmet.js (Node.js projelerinde), SQL injection prepared statements, and input sanitization are applied by default.

Additional security implementations:
- HTTPS-ready with Helmet security headers
- CORS configuration to prevent unauthorized access
- bcryptjs password hashing (10-round salt)
- JWT token verification on protected routes
- Input validation on all endpoints
- Secure error messages (no stack traces in production)
- Rate limiting to prevent brute force attacks
- Request correlation for security audit trails
- Automatic token expiry enforcement

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Docker (optional, for containerization)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ienesacikgoz/express-rate-limiter-logging-middleware.git
cd express-rate-limiter-logging-middleware
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

### 4. Start the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

### 5. Verify the Application

```bash
# Health check
curl http://localhost:3000/health

# Ready check
curl http://localhost:3000/ready
```

## 🐳 Docker Setup

```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

## 📚 API Endpoints

### Health & Status

#### Health Check
```bash
GET /health
Response: { "status": "healthy", "timestamp": "...", "uptime": ... }
```

#### Ready Check
```bash
GET /ready
Response: { "ready": true, "timestamp": "..." }
```

### Authentication

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response:
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "userId": 12345,
    "email": "john@example.com",
    "name": "John Doe"
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Rate Limit**: 5 requests per 15 minutes per IP

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "userId": 12345,
    "email": "john@example.com",
    "name": "John Doe"
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Rate Limit**: 5 requests per 15 minutes per IP

### Users (Protected Routes)

All user endpoints require authentication via JWT token in Authorization header:
```
Authorization: Bearer <token>
```

#### Get All Users
```bash
GET /api/users
Authorization: Bearer <token>

Response:
{
  "data": [
    {
      "userId": 1,
      "email": "user1@example.com",
      "name": "User One",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Rate Limit**: 1000 requests per hour per user

#### Get User by ID
```bash
GET /api/users/:userId
Authorization: Bearer <token>

Response:
{
  "data": {
    "userId": 1,
    "email": "user1@example.com",
    "name": "User One",
    "createdAt": "2026-01-01T00:00:00Z"
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Update User Profile
```bash
PUT /api/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}

Response:
{
  "message": "Profile updated successfully",
  "data": {
    "userId": 1,
    "email": "newemail@example.com",
    "name": "Updated Name",
    "updatedAt": "2026-01-01T12:00:00Z"
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## 🛠️ Development

### Available npm Scripts

```bash
npm start              # Start production server
npm run dev            # Start with auto-reload
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
npm run lint          # Run ESLint and fix issues
npm run docker:build  # Build Docker image
npm run docker:run    # Run Docker container
```

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment (development/production) |
| `PORT` | 3000 | Server port |
| `LOG_LEVEL` | debug | Logging level (debug/info/warn/error) |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 minutes in ms) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |
| `JWT_SECRET` | secret-key | JWT signing secret |
| `JWT_EXPIRY` | 24h | Token expiry duration |
| `CORS_ORIGIN` | http://localhost:3000 | Allowed CORS origin |

## 📊 Rate Limiting Strategy

Three-tier rate limiting approach:

### 1. **IP-Based Limiter** (General API)
- **Window**: 15 minutes
- **Limit**: 100 requests
- **Applied to**: All endpoints
- **Purpose**: Prevent general API abuse

### 2. **Auth Limiter** (Authentication Endpoints)
- **Window**: 15 minutes
- **Limit**: 5 requests
- **Applied to**: `/api/auth/register`, `/api/auth/login`
- **Purpose**: Prevent brute force attacks

### 3. **User Limiter** (Protected Routes)
- **Window**: 1 hour
- **Limit**: 1000 requests per authenticated user
- **Applied to**: `/api/users/*`
- **Purpose**: Fair usage for authenticated users

### User-Aware Rate Limiting Example

The user limiter tracks authenticated users separately from anonymous IPs, allowing fair rate limits per user:

```javascript
// src/config/rateLimiter.js
const createUserLimiter = (options = {}) => {
  return createRateLimiter({
    ...options,
    keyGenerator: (req) => {
      // Use user ID if authenticated, fall back to IP for anonymous requests
      return req.userId ? `user_${req.userId}` : ipKeyGenerator(req);
    },
  });
};

// Applied in routes
app.use('/api/users', userLimiter, userRoutes);
```

**How it works:**
- Authenticated requests are tracked by `user_<userId>`, allowing each user their own 1000 req/hour quota
- Unauthenticated requests share the IP-based limit (100 req/15 min)
- This prevents a single user from monopolizing bandwidth while allowing multiple users to use the API simultaneously

## 🔍 Logging Features

### Log Levels

- **ERROR**: Critical errors and failures
- **WARN**: Warnings and suspicious activities
- **INFO**: General application flow
- **DEBUG**: Detailed debugging information

### Log Output

Logs are written to:
- **Console**: Colorized output in development
- **Files**: 
  - `logs/error.log` - Error-level logs only
  - `logs/combined.log` - All logs

### Log Context

All logs include:
- **Timestamp**: ISO 8601 format
- **Level**: Log severity
- **Request ID**: Unique correlation ID for tracing
- **User ID**: Authenticated user (if applicable)
- **Message**: Log message
- **Metadata**: Additional context-specific data

Example log entry:
```
[2026-01-01 12:00:00] [INFO] [550e8400-e29b-41d4-a716-446655440000] User logged in successfully [User: 12345]
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test authController.test.js

# Generate coverage report
npm test -- --coverage
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Change PORT in .env
PORT=3001 npm start

# Or kill the process using the port
# On PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Rate Limit Exceeded

If you're hitting rate limits during testing, adjust in `.env`:
```bash
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour
RATE_LIMIT_MAX_REQUESTS=1000   # 1000 requests
```

### JWT Token Issues

Make sure your `JWT_SECRET` is:
- Set in `.env`
- Long enough (minimum 32 characters recommended)
- Consistent across all instances

### Missing Logs Directory

The application creates the logs directory automatically. If permissions issues occur:
```bash
mkdir logs
chmod 755 logs
```

## 📦 Project Structure

```
express-rate-limiter-logging-middleware/
├── src/
│   ├── config/
│   │   ├── logger.js              # Winston logger setup
│   │   └── rateLimiter.js         # Rate limiter configuration
│   ├── controller/
│   │   ├── authController.js      # Auth endpoints logic
│   │   └── userController.js      # User endpoints logic
│   ├── middleware/
│   │   ├── auth.js                # JWT authentication
│   │   ├── errorHandler.js        # Error handling
│   │   └── requestId.js           # Request correlation ID
│   ├── routes/
│   │   ├── authRoutes.js          # Auth endpoints
│   │   └── userRoutes.js          # User endpoints
│   ├── index.js                   # Application entry point
│   └── logs/                      # Generated log files
├── Dockerfile
├── package.json
├── .env.example
└── README.md
```

## 🔄 Request Flow Example

```
POST /api/auth/login
  ↓
Helmet (Add security headers)
  ↓
CORS (Check origin)
  ↓
Request ID Middleware (Generate correlation ID)
  ↓
Auth Rate Limiter (Check: 5 req/15 min)
  ↓
Auth Controller (Validate credentials)
  ↓
Generate JWT Token
  ↓
Log successful login with correlation ID
  ↓
Return token + user data + requestId
```

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Update `JWT_SECRET` with a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Configure appropriate `LOG_LEVEL=info`
- [ ] Set correct `CORS_ORIGIN` for your domain
- [ ] Adjust rate limits based on expected traffic
- [ ] Enable HTTPS/TLS at reverse proxy level
- [ ] Set up log rotation for `logs/` directory
- [ ] Configure monitoring/alerting

### Environment for Production

```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
JWT_SECRET=<very-long-random-string>
JWT_EXPIRY=24h
CORS_ORIGIN=https://yourdomain.com
```

### Using with Reverse Proxy

Behind Nginx:
```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Request-ID $request_id;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📖 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [Winston Logger](https://github.com/winstonjs/winston)
- [express-rate-limit](https://github.com/nfriedly/express-rate-limit)
- [Helmet.js](https://helmetjs.github.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

**Made with ❤️ by a Senior Backend Engineer**
