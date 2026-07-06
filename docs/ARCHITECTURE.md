# Architecture & Design Patterns

This document explains the architectural decisions and design patterns used in this Express.js Production Starter project.

## Overview

The Express Rate Limiter & Logging Middleware is built using a layered architecture with clear separation of concerns:

```
Request → Middleware → Controller → Service → Response
            ↓
         Logger & Rate Limiter
```

## Design Patterns

### 1. Middleware Pattern

Express middleware wraps request/response cycle:

```javascript
// Request ID Middleware
const requestIdMiddleware = (req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};

// Rate Limiting Middleware
app.use(ipLimiter);
app.use(authLimiter);
```

Benefits:
- Centralized cross-cutting concerns
- Composable and reusable
- Easy to test
- Clear execution order

### 2. Structured Logging Pattern

Winston logger with context:

```javascript
logger.info('User authenticated', {
  requestId,
  userId,
  email,
  timestamp: new Date(),
});
```

Benefits:
- Machine-readable logs
- Easy filtering and searching
- Correlation tracking
- Performance monitoring

### 3. Rate Limiting Strategy

Three-tier approach:

- **IP-based**: Prevents general abuse
- **Auth-based**: Prevents brute force
- **User-based**: Fair usage for authenticated users

```javascript
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.ip,
});

const userLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  keyGenerator: (req) => `user_${req.userId}`,
});
```

### 4. Controller Pattern

Thin controllers focused on HTTP:

```javascript
static async register(req, res, next) {
  try {
    const result = await service.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
```

Benefits:
- Single responsibility
- Easy to test
- Clear request/response handling

### 5. Error Handling Pattern

Centralized error middleware:

```javascript
const errorHandler = (err, req, res, next) => {
  logger.error('Request error', {
    requestId: req.id,
    error: err.message,
    stack: err.stack,
  });

  res.status(err.statusCode || 500).json({
    error: err.code || 'internal_error',
    message: err.message,
    requestId: req.id,
  });
};

app.use(errorHandler);
```

Benefits:
- Consistent error responses
- Centralized logging
- No try-catch duplication

## Security Considerations

### Rate Limiting

Protects against:
- Brute force attacks (auth endpoints)
- DDoS attacks (IP-based limiting)
- Resource exhaustion
- API abuse

### Authentication

JWT tokens with:
- Expiry enforcement
- Token validation
- User context in logs
- Secure comparison

### Input Validation

```javascript
const schema = {
  email: z.string().email(),
  password: z.string().min(8),
};

// Validate before processing
```

### CORS

Restrict to authorized origins:

```javascript
cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
})
```

## Performance Optimization

### Logging

- Asynchronous writes to files
- Console output for local dev
- Structured format for parsing
- Configurable log levels

### Rate Limiting

- In-memory store for development
- Redis store for production (distributed)
- Efficient key generation
- Low overhead processing

### Middleware Ordering

```javascript
app.use(helmet()); // Security headers first
app.use(cors()); // CORS handling
app.use(requestIdMiddleware); // Correlation tracking
app.use(ipLimiter); // Rate limiting before body parsing
app.use(express.json()); // Body parsing
```

## Testing Strategy

### Unit Tests

Test individual functions:

```javascript
describe('authController', () => {
  it('should register user with valid data', async () => {
    const req = { body: { email: '...', password: '...' } };
    const res = { status: jest.fn().json };
    
    await authController.register(req, res);
    
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
```

### Integration Tests

Test full request cycle:

```javascript
it('should rate limit auth endpoint', async () => {
  for (let i = 0; i < 6; i++) {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    
    if (i < 5) {
      expect(res.status).toBe(401);
    } else {
      expect(res.status).toBe(429);
    }
  }
});
```

## Configuration Management

```javascript
// Environment-based configuration
const config = {
  development: {
    logLevel: 'debug',
    rateLimitMax: 1000,
  },
  production: {
    logLevel: 'info',
    rateLimitMax: 100,
  },
}[process.env.NODE_ENV];
```

## Scalability Considerations

### Stateless Design

Services are horizontally scalable:
- No in-memory state
- Session data in JWT
- Distributed rate limiting via Redis

### Load Balancing

```nginx
upstream api {
  least_conn;
  server localhost:3000;
  server localhost:3001;
  server localhost:3002;
}
```

### Database Connection Pooling

Handled by ORM/driver:
- Connection reuse
- Pool size tuning
- Idle connection cleanup

## Deployment Patterns

### Blue-Green Deployment

```bash
# Maintain two production environments
# Deploy new version to green
# Route traffic to green once ready
# Keep blue as rollback
```

### Canary Deployment

```bash
# Route 10% traffic to new version
# Monitor metrics
# Gradually increase traffic
# Full rollout or rollback
```

## Monitoring & Observability

### Key Metrics

- Request rate (req/sec)
- Response time (p50, p95, p99)
- Error rate (%)
- Rate limit hits
- Active connections

### Log Aggregation

Centralize logs from all instances:
- ELK Stack
- Splunk
- DataDog
- CloudWatch

### Distributed Tracing

Correlation IDs enable:
- Request tracing across services
- Performance bottleneck identification
- Error root cause analysis

---

For more information, see the main [README.md](../README.md) and [CONTRIBUTING.md](./CONTRIBUTING.md).
