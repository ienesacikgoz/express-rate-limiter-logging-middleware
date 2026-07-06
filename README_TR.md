# Express.js Production Başlangıcı - Rate Limiting & Yapılandırılmış Logging

> Üretim ortamına hazır bir Express uygulaması şablonu.

Ölçeklenebilir API'ler geliştirmek için rate limiting (IP tabanlı ve kullanıcı bazlı), yapılandırılmış logging, JWT kimlik doğrulaması, güvenlik başlıkları ve kapsamlı hata işleme özellikleriyle birlikte gelen tam yapılandırılmış bir Express.js uygulama şablonu.

[📖 English Version](./README.md) | 🇹🇷 Türkçe

---

## ✨ Özellikler

- **Gelişmiş Rate Limiting**: IP tabanlı ve kullanıcı bazlı limitler
- **Yapılandırılmış Logging**: Winston logger ile renklendirilen konsol ve dosya çıkışı
- **Request Correlation ID'leri**: Dağıtılmış izleme için benzersiz request takibi
- **Güvenlik Başlıkları**: Helmet.js entegrasyonu
- **JWT Kimlik Doğrulaması**: Token tabanlı kullanıcı doğrulaması
- **CORS Desteği**: Çapraz kaynak paylaşımı yapılandırması
- **Health Check Endpoints**: Orchestration için `/health` ve `/ready` uç noktaları
- **Request Zamanlama**: Otomatik yanıt süresi takibi
- **Kullanıcı Bazlı Logging**: Doğrulanan kullanıcı bağlamı tüm log'lara dahil

## 📚 Dokümantasyon

- **[Hızlı Başlangıç](./docs/QUICKSTART_TR.md)** — 3 dakikada başlayın
- **[Mimari](./docs/ARCHITECTURE_TR.md)** — Tasarım desenleri ve sistem mimarisi
- **[Dağıtım](./docs/DEPLOYMENT_TR.md)** — Üretim dağıtımı rehberi (Docker, Kubernetes, Cloud)
- **[Katkıda Bulunma](./docs/CONTRIBUTING_TR.md)** — Projeye katkıda bulunma süreci

---

## 🚀 Hızlı Başlangıç

### 1. Depo'yu Klonlayın

```bash
git clone https://github.com/ienesacikgoz/express-rate-limiter-logging-middleware.git
cd express-rate-limiter-logging-middleware
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortamı Yapılandırın

```bash
cp .env.example .env
```

`.env` dosyasındaki değerleri gerekli şekilde güncelleyin:

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=24h
CORS_ORIGIN=http://localhost:3000
```

### 4. Uygulamayı Başlatın

```bash
# Geliştirme modu (otomatik yeniden yükleme ile)
npm run dev

# Üretim modu
npm start
```

Sunucu `http://localhost:3000` adresinde başlayacaktır.

---

## 📚 API Uç Noktaları

### Kimlik Doğrulama

#### Kullanıcı Kaydı
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Rate Limit**: 5 istek / 15 dakika (IP başına)

#### Giriş
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Rate Limit**: 5 istek / 15 dakika (IP başına)

### Kullanıcılar (Korunan Rotalar)

Tüm kullanıcı uç noktaları JWT token'ı gerektirir:

```bash
Authorization: Bearer <token>
```

#### Tüm Kullanıcıları Al
```bash
GET /api/users
Authorization: Bearer <token>
```

**Rate Limit**: 1000 istek / saat (kullanıcı başına)

#### Kullanıcıyı ID ile Al
```bash
GET /api/users/:userId
Authorization: Bearer <token>
```

#### Kullanıcı Profilini Güncelle
```bash
PUT /api/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

---

## 📊 Rate Limiting Stratejisi

### Üç Katmanlı Yaklaşım

1. **IP Tabanlı Limiter** (Genel API)
   - 15 dakikada 100 istek
   - Tüm uç noktalara uygulanır

2. **Auth Limiter** (Kimlik Doğrulama)
   - 15 dakikada 5 istek
   - `/api/auth/register` ve `/api/auth/login` uç noktalarına uygulanır

3. **Kullanıcı Limiter** (Korunan Rotalar)
   - 1 saatte 1000 istek (kimliği doğrulanan kullanıcı başına)
   - `/api/users/*` rotalarına uygulanır

---

## 🔍 Logging Özellikleri

Tüm log'lar şu bilgileri içerir:

- **Zaman Damgası**: ISO 8601 formatı
- **Seviye**: Log önem düzeyi (ERROR, WARN, INFO, DEBUG)
- **Request ID**: Dağıtılmış izleme için benzersiz correlation ID
- **Kullanıcı ID**: Kimliği doğrulanan kullanıcı (varsa)
- **İleti**: Log mesajı
- **Metadata**: Ek bağlam bilgisi

Örnek log:
```
[2026-01-01 12:00:00] [INFO] [550e8400-e29b-41d4-a716-446655440000] Kullanıcı başarıyla giriş yaptı [User: 12345]
```

---

## 🧪 Testler

```bash
# Tüm testleri çalıştır
npm test

# Test'leri izleme modunda çalıştır
npm run test:watch
```

---

## 🐛 Sorun Giderme

### Port Zaten Kullanımda

```bash
# .env dosyasında PORT'u değiştir
PORT=3001 npm start

# Veya PowerShell'de portu kullanan işlemi sonlandır
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Rate Limit Aşıldı

`.env` dosyasını güncelle:
```bash
RATE_LIMIT_WINDOW_MS=3600000  # 1 saat
RATE_LIMIT_MAX_REQUESTS=1000   # 1000 istek
```

### JWT Token Sorunları

`JWT_SECRET` için:
- `.env` dosyasında tanımlanmış olmalı
- Yeterince uzun olmalı (minimum 32 karakter önerilir)
- Tüm instance'larda tutarlı olmalı

---

## 📦 Proje Yapısı

```
express-rate-limiter-logging-middleware/
├── src/
│   ├── config/
│   │   ├── logger.js              # Winston logger kurulumu
│   │   └── rateLimiter.js         # Rate limiter yapılandırması
│   ├── controller/
│   │   ├── authController.js      # Kimlik doğrulama mantığı
│   │   └── userController.js      # Kullanıcı mantığı
│   ├── middleware/
│   │   ├── auth.js                # JWT kimlik doğrulaması
│   │   ├── errorHandler.js        # Hata işleme
│   │   └── requestId.js           # Request correlation ID
│   ├── routes/
│   │   ├── authRoutes.js          # Kimlik doğrulama uç noktaları
│   │   └── userRoutes.js          # Kullanıcı uç noktaları
│   ├── index.js                   # Uygulama giriş noktası
│   └── logs/                      # Oluşturulan log dosyaları
├── Dockerfile
├── package.json
├── .env.example
└── README.md
```

---

## 🚀 Üretim Dağıtımı

Dağıtım öncesi kontrol listesi:

- [ ] `JWT_SECRET` güçlü bir rastgele string ile güncelleyin
- [ ] `NODE_ENV=production` olarak ayarlayın
- [ ] `LOG_LEVEL=info` olarak yapılandırın
- [ ] `CORS_ORIGIN` için doğru domain'i ayarlayın
- [ ] Beklenen trafiğe göre rate limit'leri ayarlayın
- [ ] HTTPS/TLS'yi reverse proxy seviyesinde etkinleştirin

---

## 📖 Kaynaklar

- [Express.js Dokümantasyonu](https://expressjs.com/)
- [Winston Logger](https://github.com/winstonjs/winston)
- [express-rate-limit](https://github.com/nfriedly/express-rate-limit)
- [Helmet.js](https://helmetjs.github.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## 📄 Lisans

MIT Lisansı - Ayrıntılar için [LICENSE](LICENSE) dosyasına bakın.

---

**❤️ ile yapılmış**
