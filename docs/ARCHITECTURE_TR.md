# Mimari & Tasarım Desenleri

Bu belge, Express.js Production Başlangıcı projesinde kullanılan mimari kararları ve tasarım desenlerini açıklar.

## Genel Bakış

Express Rate Limiter & Logging Middleware, açık sorumluluk ayrımı ile katmanlı bir mimari kullanılarak oluşturulmuştur:

```
İstek → Middleware → Controller → Service → Yanıt
          ↓
    Logger & Rate Limiter
```

## Tasarım Desenleri

### 1. Middleware Deseni

Express middleware istek/yanıt döngüsünü sarar:

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

Avantajları:
- Merkezi çapraz kesinti sorunları
- Bileşebilir ve yeniden kullanılabilir
- Test edilmesi kolay
- Net yürütme sırası

### 2. Yapılandırılmış Logging Deseni

Winston logger'ı bağlam ile:

```javascript
logger.info('Kullanıcı kimliği doğrulandı', {
  requestId,
  userId,
  email,
  timestamp: new Date(),
});
```

Avantajları:
- Makine tarafından okunabilir log'lar
- Kolay filtreleme ve arama
- Correlation takibi
- Performans izleme

### 3. Rate Limiting Stratejisi

Üç katmanlı yaklaşım:

- **IP tabanlı**: Genel istismarları engelle
- **Auth tabanlı**: Brute force'ları engelle
- **Kullanıcı tabanlı**: Kimliği doğrulanan kullanıcılar için adil kullanım

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

### 4. Controller Deseni

HTTP'ye odaklanmış ince controller'lar:

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

Avantajları:
- Tek sorumluluk
- Test edilmesi kolay
- Net istek/yanıt işleme

### 5. Hata İşleme Deseni

Merkezi hata middleware'i:

```javascript
const errorHandler = (err, req, res, next) => {
  logger.error('İstek hatası', {
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

Avantajları:
- Tutarlı hata yanıtları
- Merkezi logging
- Try-catch tekrarlaması yok

## Güvenlik Düşünceleri

### Rate Limiting

Korunur:
- Brute force saldırıları (auth uç noktaları)
- DDoS saldırıları (IP tabanlı limitler)
- Kaynak tükenmesi
- API istismarı

### Kimlik Doğrulama

JWT token'ları ile:
- Süre sonu uygulanması
- Token doğrulaması
- Log'lardaki kullanıcı bağlamı
- Güvenli karşılaştırma

### Giriş Doğrulaması

```javascript
const schema = {
  email: z.string().email(),
  password: z.string().min(8),
};

// İşlemeden önce doğrula
```

### CORS

Yetkili kaynaklara sınırla:

```javascript
cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
})
```

## Performans Optimizasyonu

### Logging

- Dosyalara asenkron yazma
- Yerel geliştirme için konsol çıkışı
- Ayrıştırma için yapılandırılmış format
- Yapılandırılabilir log seviyeleri

### Rate Limiting

- Geliştirme için bellek içi depo
- Üretim için Redis deposu (dağıtılmış)
- Verimli anahtar oluşturma
- Düşük genel kütlük işleme

### Middleware Sırası

```javascript
app.use(helmet()); // Güvenlik başlıkları ilk
app.use(cors()); // CORS işleme
app.use(requestIdMiddleware); // Correlation takibi
app.use(ipLimiter); // Body ayrıştırma öncesi rate limiting
app.use(express.json()); // Body ayrıştırma
```

## Test Stratejisi

### Unit Test'ler

Bireysel fonksiyonları test et:

```javascript
describe('authController', () => {
  it('geçerli verilerle kullanıcı kaydı yapmalı', async () => {
    const req = { body: { email: '...', password: '...' } };
    const res = { status: jest.fn().json };
    
    await authController.register(req, res);
    
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
```

### Entegrasyon Test'leri

Tam istek döngüsünü test et:

```javascript
it('auth uç noktasında rate limit uygulamalı', async () => {
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

## Konfigürasyon Yönetimi

```javascript
// Ortam tabanlı konfigürasyon
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

## Ölçeklenebilirlik Düşünceleri

### Durumsuz Tasarım

Hizmetler yatay olarak ölçeklenebilir:
- Bellek içi durum yok
- JWT'de oturum verileri
- Redis aracılığıyla dağıtılmış rate limiting

### Yük Dengeleme

```nginx
upstream api {
  least_conn;
  server localhost:3000;
  server localhost:3001;
  server localhost:3002;
}
```

### Veritabanı Bağlantı Havuzu

ORM/sürücü tarafından işlenir:
- Bağlantı yeniden kullanımı
- Havuz boyutu ayarlaması
- Boş bağlantı temizliği

## Dağıtım Desenleri

### Mavi-Yeşil Dağıtım

```bash
# İki üretim ortamı koru
# Yeni sürümü yeşile dağıt
# Hazır olunca trafiği yeşile yönlendir
# Mavi rollback olarak kalsın
```

### Kanarya Dağıtımı

```bash
# Trafiğin %10'unu yeni sürüme yönlendir
# Metrikler izle
# Trafiği kademeli olarak arttır
# Tam dağıtım veya rollback
```

## İzleme & Gözlemlenebilirlik

### Temel Metrikler

- İstek oranı (req/sn)
- Yanıt süresi (p50, p95, p99)
- Hata oranı (%)
- Rate limit isabetleri
- Aktif bağlantılar

### Log Toplama

Tüm instance'lardan log'ları merkezi hale getir:
- ELK Stack
- Splunk
- DataDog
- CloudWatch

### Dağıtılmış İzleme

Correlation ID'leri etkinleştir:
- Hizmetler arasında istek izleme
- Performans darboğaz belirleme
- Hata kök neden analizi

---

Daha fazla bilgi için [ana README.md](../README_TR.md) ve [CONTRIBUTING.md](./CONTRIBUTING_TR.md) bakın.
