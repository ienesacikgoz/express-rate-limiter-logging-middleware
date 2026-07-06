# Hızlı Başlangıç Rehberi

Express.js Production Başlangıcını Rate Limiting & Yapılandırılmış Logging ile 3 dakikada çalıştırın.

## Ön Koşullar

- Node.js 18+
- npm
- Git
- curl (test için)

## Kurulum

```bash
# Depo'yu klonla ve dizine gir
git clone https://github.com/ienesacikgoz/express-rate-limiter-logging-middleware.git
cd express-rate-limiter-logging-middleware

# Ortam dosyasını kopyala
cp .env.example .env

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

## API'yi Test Et

Sunucu `http://localhost:3000` adresinde çalışır

### Health Check

```bash
curl http://localhost:3000/health | jq .
```

### Kullanıcı Kaydı

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }' | jq .
```

Yanıttan `token` değerini kaydet.

### Giriş

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }' | jq .
```

### Tüm Kullanıcıları Al (Korunan)

```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .
```

## Otomatik Test

Tam test scriptini çalıştır:

```bash
bash scripts/test-api.sh
```

## Rate Limiting Test

Auth uç noktasına 6 hızlı istek yap (limit 5 / 15 dakika):

```bash
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "wrong"}' | jq '.error // .message'
done
```

6. istek `429 Too Many Requests` döndürmelidir.

## Docker

```bash
# İmajı oluştur
npm run docker:build

# Konteyner'ı çalıştır
npm run docker:run

# Veya özel env ile
docker run -p 3000:3000 --env-file .env express-rate-limiter:latest
```

## Geliştirme Komutları

```bash
npm run dev        # Otomatik yeniden yükleme ile başlat
npm test           # Testleri çalıştır
npm run lint       # Linter'ı çalıştır
npm run docker:build  # Docker imajını oluştur
```

## Ne Çalışıyor?

- **API**: http://localhost:3000
- **Health**: http://localhost:3000/health
- **Logs**: Konsol çıkışı ve `logs/` dizini göreceksin

## Temel Özellikler

✅ Gelişmiş Rate Limiting (IP, Auth, Kullanıcı tabanlı)  
✅ Winston ile Yapılandırılmış Logging  
✅ Request Correlation ID'leri  
✅ JWT Kimlik Doğrulaması  
✅ Güvenlik Başlıkları (Helmet.js)  
✅ Özel Hata Yönetimi  
✅ CORS Desteği  

## Ortam Değişkenleri

```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
```

## Sonraki Adımlar

- Ayrıntılı dokümantasyon için [tam README](../README_TR.md) oku
- Geliştirme rehberi için [CONTRIBUTING.md](./CONTRIBUTING_TR.md) kontrolü yap
- Tasarım desenleri için [Mimari](./ARCHITECTURE_TR.md) incelesini oku
- Üretim kurulumu için [Dağıtım Rehberi](./DEPLOYMENT_TR.md) bakın

## Sorun Giderme

**Port 3000 zaten kullanımda?**
```bash
# Farklı port kullan
PORT=3001 npm run dev
```

**Modül bulunamadı?**
```bash
# Bağımlılıkları yeniden yükle
rm -rf node_modules package-lock.json
npm install
```

**Scriptlerde izin hatası?**
```bash
chmod +x scripts/*.sh
```

---

**Yardım lazım?** [README.md](../README_TR.md) bakın veya GitHub'da bir issue açın.
