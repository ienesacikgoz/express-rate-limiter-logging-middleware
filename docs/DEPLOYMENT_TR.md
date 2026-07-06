# Dağıtım Rehberi

Bu rehber, Express.js Production Başlangıcını Rate Limiting & Yapılandırılmış Logging ile çeşitli ortamlara dağıtmayı kapsar.

## İçindekiler
- [Yerel Geliştirme](#yerel-geliştirme)
- [Docker](#docker)
- [Kubernetes](#kubernetes)
- [Bulut Platformları](#bulut-platformları)
- [Ortam Yapılandırması](#ortam-yapılandırması)
- [Ölçekleme](#ölçekleme)
- [İzleme](#izleme)

## Yerel Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Ortamı kur
cp .env.example .env

# Geliştirme modu
npm run dev

# Uç noktaları test et
curl http://localhost:3000/health
```

## Docker

```bash
# İmajı oluştur
npm run docker:build

# Konteyner'ı çalıştır
npm run docker:run

# Ortam dosyası ile
docker run -p 3000:3000 --env-file .env express-rate-limiter:latest
```

## Kubernetes

### ConfigMap ve Secrets

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

Dağıt:
```bash
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
kubectl apply -f deployment.yaml

kubectl get pods
kubectl logs -f deployment/express-api
```

## Bulut Platformları

### AWS ECS/Fargate

```bash
# ECR'a push et
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com
docker build -t express-rate-limiter:1.0.0 .
docker tag express-rate-limiter:1.0.0 [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/express-rate-limiter:1.0.0
docker push [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/express-rate-limiter:1.0.0

# ECS task definition ortam değişkenleri ile oluştur
# CloudFormation veya Console aracılığıyla dağıt
```

### Google Cloud Run

```bash
# Oluştur ve dağıt
gcloud builds submit --tag gcr.io/[PROJECT_ID]/express-rate-limiter:1.0.0
gcloud run deploy express-api \
  --image gcr.io/[PROJECT_ID]/express-rate-limiter:1.0.0 \
  --platform managed \
  --region us-central1 \
  --set-env-vars JWT_SECRET=[SECRET],CORS_ORIGIN=[ORIGIN]
```

### Heroku

```bash
# Uygulama oluştur
heroku create express-rate-limiter-api

# Dağıt
git push heroku main

# Ortam değişkenlerini kur
heroku config:set JWT_SECRET=[SECRET] CORS_ORIGIN=[ORIGIN]

# Log'ları görüntüle
heroku logs --tail
```

## Ortam Yapılandırması

### Üretim Ortam Değişkenleri

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

### Gizli Yönetimi

Kullan:
- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault
- Ortam değişkeni servisleri (Heroku Config Vars, vb.)

## Ölçekleme

### Yatay Ölçekleme

```bash
# Docker Compose
docker-compose up -d --scale app=5

# Kubernetes
kubectl scale deployment express-api --replicas=5
```

### Yük Dengeleme

**Nginx Yapılandırması**:
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

### Otomatik Ölçekleme

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

## İzleme

### Log'lar

Uygulama log'larına eriş:
```bash
# Docker
docker logs [container_id]

# Kubernetes
kubectl logs deployment/express-api

# Cloud Run
gcloud run logs read express-api --limit 50
```

### Metrikler

İzleme sistemlerine dışa aktar:
- Prometheus
- DataDog
- New Relic
- CloudWatch

Temel metrikler:
- İstek oranı
- Yanıt süresi
- Hata oranı
- Rate limit isabetleri
- Aktif bağlantılar

### Uyarılar

Uyarıları kur:
- Hata oranı > %1
- Yanıt süresi p95 > 1sn
- Yüksek rate limit ihlalleri
- Hizmet kullanılamaz olması

## Performans Ayarlaması

### Node.js Yapılandırması

```bash
# Worker thread'lerini arttır
NODE_OPTIONS=--max-old-space-size=512

# Clustering'i etkinleştir (uygulama kodunda)
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
}
```

### Rate Limiter Optimizasyonu

```javascript
// Dağıtılmış rate limiting için Redis'i kullan
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

### Yük Testi

```bash
# Apache Bench
ab -n 10000 -c 100 http://localhost:3000/health

# wrk
wrk -t12 -c400 -d30s http://localhost:3000/health

# Artillery
artillery run load-test.yml
```

## Yedekleme & Kurtarma

### Uygulama Yapılandırması

Sürüm kontrolüne sakla:
```bash
# .env dosyaları güvenli kasalarda
# Düzenli olarak yedekle
```

### Log Saklama

Winston log rotasyonunu yapılandır:
```javascript
new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxDays: '14d',
})
```

## Güvenlik Sertleştirmesi

- [ ] Üretimde HTTPS/TLS'yi etkinleştir
- [ ] Node.js bağımlılıklarını düzenli güncelle (`npm audit fix`)
- [ ] Güvenlik başlıklarını kullan (Helmet.js - zaten yapılandırılmış)
- [ ] CORS'u sadece kendi domain'ine uygula
- [ ] JWT gizli anahtarını düzenli döndür
- [ ] Token'lar için güvenli HTTP-only çerezlerini kullan
- [ ] İstek imzalamasını uygula
- [ ] Denetim logging'ini etkinleştir
- [ ] WAF seviyesinde rate limiting'i kullan
- [ ] Hassas verileri transit sırasında ve istirahat halinde şifrele

## Rolling Dağıtım

```bash
# Kubernetes
kubectl set image deployment/express-api app=registry.example.com/express-rate-limiter:1.1.0 --record
kubectl rollout status deployment/express-api

# Geri al
kubectl rollout undo deployment/express-api
```

---

Daha fazla bilgi için [ana README.md](../README_TR.md) ve [CONTRIBUTING.md](./CONTRIBUTING_TR.md) bakın.
