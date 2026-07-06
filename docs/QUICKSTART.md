# Quick Start Guide

Get the Express.js Production Starter with Rate Limiting & Structured Logging running in 3 minutes.

## Prerequisites

- Node.js 18+
- npm
- Git
- curl (for testing)

## Installation

```bash
# Clone and enter directory
git clone https://github.com/ienesacikgoz/express-rate-limiter-logging-middleware.git
cd express-rate-limiter-logging-middleware

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

## Test the API

The server runs on `http://localhost:3000`

### Health Check

```bash
curl http://localhost:3000/health | jq .
```

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }' | jq .
```

Save the `token` from the response.

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }' | jq .
```

### Get All Users (Protected)

```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .
```

## Automated Testing

Run the complete test script:

```bash
bash scripts/test-api.sh
```

## Rate Limiting Test

Make 6 rapid requests to auth endpoint (limit is 5 per 15 minutes):

```bash
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "wrong"}' | jq '.error // .message'
done
```

The 6th request should return `429 Too Many Requests`.

## Docker

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run

# Or with custom env
docker run -p 3000:3000 --env-file .env express-rate-limiter:latest
```

## Development Commands

```bash
npm run dev        # Start with auto-reload
npm test           # Run tests
npm run lint       # Run linter
npm run docker:build  # Build Docker image
```

## What's Running?

- **API**: http://localhost:3000
- **Health**: http://localhost:3000/health
- **Logs**: See console output and `logs/` directory

## Key Features

✅ Advanced Rate Limiting (IP, Auth, User-based)  
✅ Structured Logging with Winston  
✅ Request Correlation IDs  
✅ JWT Authentication  
✅ Security Headers (Helmet.js)  
✅ Custom Error Handling  
✅ CORS Support  

## Environment Variables

```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
```

## Next Steps

- Read the [full README](../README.md) for detailed documentation
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
- Review [Architecture](./ARCHITECTURE.md) for design patterns
- See [Deployment Guide](./DEPLOYMENT.md) for production setup

## Troubleshooting

**Port 3000 already in use?**
```bash
# Use different port
PORT=3001 npm run dev
```

**Module not found?**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Permission denied on scripts?**
```bash
chmod +x scripts/*.sh
```

---

**Need help?** See [README.md](../README.md) or open an issue on GitHub.
