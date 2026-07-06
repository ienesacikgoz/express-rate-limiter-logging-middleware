# Express.js Production Başlangıcına Katkıda Bulunma

Bu projeye katkıda bulunmayı düşündüğün için teşekkürler! Bu belge katkıda bulunma rehberi ve talimatlarını sağlar.

## Davranış Kuralları

Tüm etkileşimlerde saygılı, kapsayıcı ve profesyonel ol.

## Başlangıç

1. Repository'yi fork'la
2. Fork'unuzu klonla: `git clone https://github.com/ienesacikgoz/express-rate-limiter-logging-middleware.git`
3. Bağımlılıkları yükle: `npm install`
4. Ortamı kur: `cp .env.example .env`

## Geliştirme İş Akışı

### Yerel Ortamı Kur

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Test'leri çalıştır
npm test
```

### Kod Stili

- ESLint'i kullan: `npm run lint`
- Kodun tutarlı formatlanması
- Anlamlı değişken adlarını kullan
- Fonksiyonlar için JSDoc yorumları ekle
- Yeni özellikler için test yaz

### Test'ler

```bash
# Tüm test'leri çalıştır
npm test

# Test'leri izleme modunda çalıştır
npm run test:watch

# Kapsam raporunu oluştur
npm test -- --coverage
```

### Commit Mesajları

- Açık, açıklayıcı mesajlar kullan
- Fiil ile başla: "Add", "Fix", "Update", "Remove"
- İlk satırı 50 karakterin altında tut
- Gerekirse gövdede ayrıntılar ekle

İyi: `Add user-based rate limiting middleware`
Kötü: `fix stuff`

## Pull Request Süreci

1. README.md'yi API değişiklikleri ile güncelle
2. Test'leri çalıştır ve geçtiğinden emin ol: `npm test`
3. Linter'ı çalıştır: `npm run lint`
4. Kod kapsamının azalmadığından emin ol
5. PR'ye değişikliklerin açıklamasını ekle
6. İlgili issue'ları bağla

## Sorunları Bildir

Şunları ekle:
- Sorunun açık tanımı
- Yeniden üretme adımları
- Beklenen vs gerçek davranış
- Node sürümü ve OS
- İlgili log'lar veya hata mesajları

## Proje Yapısı

```
src/
├── config/           - Yapılandırma (logger, rate limiter)
├── controller/       - İstek yöneticileri
├── middleware/       - Express middleware
├── routes/           - API rotaları
└── index.js          - Uygulama giriş noktası
```

## Middleware Geliştirme

Yeni middleware eklerken:

1. `src/middleware/` içinde dosya oluştur
2. Express middleware fonksiyonu olarak dışa aktar
3. Hata işleme ekle
4. Logging ekle
5. README'de dokümante et

Örnek:
```javascript
const myMiddleware = (req, res, next) => {
  // İşlevsellik ekle
  next();
};

module.exports = myMiddleware;
```

## Sorularım Mı Var?

- Mevcut issue'ları ve tartışmaları kontrol et
- README ve dokümantasyonu incele
- Soru etiketi ile yeni bir issue aç

Katkıda bulunduğun için teşekkürler! 🙏
