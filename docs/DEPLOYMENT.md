# Deployment Guide

This guide covers deploying the Express.js Production Starter with Rate Limiting & Structured Logging to various environments.

## Table of Contents
- [Local Development](#local-development)
- [Docker](#docker)
- [Kubernetes](#kubernetes)
- [Cloud Platforms](#cloud-platforms)
- [Environment Configuration](#environment-configuration)
- [Scaling](#scaling)
- [Monitoring](#monitoring)

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Development mode
npm run dev

# Test endpoints
curl http://localhost:3000/health
```

## Docker

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run

# With environment file
docker run -p 3000:3000 --env-file .env express-rate-limiter:latest
```

## Kubernetes

### ConfigMap and Secrets

```yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: express-config
data:
  PORT: "3000"
  LOG_LEVEL: "info"
  RATE_LIMIT_WINDOW_MS: "900000"
  RATE_LIMIT_MAX_REQUESTS: "100"

---
apiVersion: v1
kind: Secret
metadata:
  name: express-secrets
type: Opaque
stringData:
  JWT_SECRET: "your-very-long-random-secret-key"
  CORS_ORIGIN: "https://yourdomain.com"

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: express-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: express-api
  template:
    metadata:
      labels:
        app: express-api
    spec:
      containers:
      - name: api
        image: registry.example.com/express-rate-limiter:1.0.0
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: express-config
        - secretRef:
            name: express-secrets
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: express-api
spec:
  selector:
    app: express-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

Deploy:
```bash
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
kubectl apply -f deployment.yaml

kubectl get pods
kubectl logs -f deployment/express-api
```

## Cloud Platforms

### AWS ECS/Fargate

```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com
docker build -t express-rate-limiter:1.0.0 .
docker tag express-rate-limiter:1.0.0 [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/express-rate-limiter:1.0.0
docker push [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/express-rate-limiter:1.0.0

# Create ECS task definition with environment variables
# Deploy via CloudFormation or Console
```

### Google Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/[PROJECT_ID]/express-rate-limiter:1.0.0
gcloud run deploy express-api \
  --image gcr.io/[PROJECT_ID]/express-rate-limiter:1.0.0 \
  --platform managed \
  --region us-central1 \
  --set-env-vars JWT_SECRET=[SECRET],CORS_ORIGIN=[ORIGIN]
```

### Heroku

```bash
# Create app
heroku create express-rate-limiter-api

# Deploy
git push heroku main

# Set environment variables
heroku config:set JWT_SECRET=[SECRET] CORS_ORIGIN=[ORIGIN]

# View logs
heroku logs --tail
```

## Environment Configuration

### Production Environment Variables

```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
JWT_SECRET=[VERY_LONG_RANDOM_STRING_32_CHARS_MIN]
JWT_EXPIRY=24h
CORS_ORIGIN=https://yourdomain.com
```

### Secrets Management

Use:
- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault
- Environment variable services (Heroku Config Vars, etc.)

## Scaling

### Horizontal Scaling

```bash
# Docker Compose
docker-compose up -d --scale app=5

# Kubernetes
kubectl scale deployment express-api --replicas=5
```

### Load Balancing

**Nginx Configuration**:
```nginx
upstream express_api {
    least_conn;
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://express_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Auto-scaling

**Kubernetes HPA**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: express-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: express-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Monitoring

### Logs

Access application logs:
```bash
# Docker
docker logs [container_id]

# Kubernetes
kubectl logs deployment/express-api

# Cloud Run
gcloud run logs read express-api --limit 50
```

### Metrics

Export to monitoring systems:
- Prometheus
- DataDog
- New Relic
- CloudWatch

Key metrics:
- Request rate
- Response time
- Error rate
- Rate limit hits
- Active connections

### Alerting

Set up alerts for:
- Error rate > 1%
- Response time p95 > 1s
- High rate limit violations
- Service unavailability

## Performance Tuning

### Node.js Configuration

```bash
# Increase worker threads
NODE_OPTIONS=--max-old-space-size=512

# Enable clustering (in app code)
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
}
```

### Rate Limiter Optimization

```javascript
// Use Redis for distributed rate limiting
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

const limiter = rateLimit({
  store: new RedisStore({
    client: redis.createClient(),
    prefix: 'rl:',
  }),
  max: 100,
  windowMs: 15 * 60 * 1000,
});
```

### Load Testing

```bash
# Apache Bench
ab -n 10000 -c 100 http://localhost:3000/health

# wrk
wrk -t12 -c400 -d30s http://localhost:3000/health

# Artillery
artillery run load-test.yml
```

## Backup & Recovery

### Application Configuration

Store in version control:
```bash
# .env files in secure vaults
# Backup regularly
```

### Log Retention

Configure Winston log rotation:
```javascript
new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxDays: '14d',
})
```

## Security Hardening

- [ ] Enable HTTPS/TLS in production
- [ ] Update Node.js dependencies regularly (`npm audit fix`)
- [ ] Use security headers (Helmet.js - already configured)
- [ ] Implement CORS for your domain only
- [ ] Rotate JWT secret regularly
- [ ] Use secure HTTP-only cookies for tokens
- [ ] Implement request signing
- [ ] Enable audit logging
- [ ] Use rate limiting at WAF level
- [ ] Encrypt sensitive data in transit and at rest

## Rolling Deployment

```bash
# Kubernetes
kubectl set image deployment/express-api app=registry.example.com/express-rate-limiter:1.1.0 --record
kubectl rollout status deployment/express-api

# Rollback
kubectl rollout undo deployment/express-api
```

---

For more information, see the main [README.md](../README.md) and [CONTRIBUTING.md](./CONTRIBUTING.md).
