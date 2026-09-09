# Yeni Uygulama Mimarisi

## Ürün yapısı

Mahmut Saltık Studio, Instagram’ın içerik keşfi kolaylığını kullanan fakat Instagram’ı taklit etmeyen kişisel sanatçı platformudur. Public uygulama bir sanatçı profili gibi davranır; admin uygulaması içerik stüdyosu gibi çalışır.

## Public bilgi mimarisi

| Bölüm | İşlev |
|---|---|
| Hero | Sanatçının değer önerisi ve sipariş CTA’sı |
| Profil özeti | İsim, biyografi, konum ve içerik istatistikleri |
| Süreç | Fotoğraftan teslimata kadar üç adım |
| Seçili notlar | Öne çıkan Studio Journal kayıtları |
| Social Archive | Manuel seçilmiş post, video ve highlight akışı |
| Çalışmalar | Arama, filtre, sıralama, video preview ve detay modalı |
| Studio Journal | Süreç, malzeme ve atölye kayıtları |
| Hakkında | Güven veren sanatçı anlatısı |
| İletişim | WhatsApp hazır mesajı ve Instagram clipboard fallback |

## Admin bilgi mimarisi

Dashboard; toplam eser, yayındaki eser, taslaklar, arşiv kayıtları ve bekleyen yorumları tek ekranda gösterir. Eserler, arşiv, günlük, yorumlar, profil ve ayarlar ayrı modüllerdir. Her içerik tipi için taslak/yayın, sıra ve silme işlemi görünür durum mesajlarıyla yönetilir.

## Teknik katmanlar

- **FastAPI:** API giriş noktası ve router kayıtları.
- **PostgreSQL/Supabase:** İçerik metadata’sı, kullanıcılar, yorumlar ve favoriler.
- **Supabase Storage:** Görsel/video byte’ları. Production’da local disk fallback kullanılmaz.
- **Vanilla JS modules:** Public ve admin davranışları; HTML string üretimi tek yerde tutulur.
- **CSS tokens:** Tek bir açık tema; tekrar eden ve çakışan tema blokları yoktur.
- **Render Docker:** Health check `/api/health`, environment variable tabanlı configuration.

## Güvenlik prensipleri

- Admin endpoint’leri `admin_user` dependency ile korunur.
- Yayınlanmamış içerik public endpoint’lerden dönmez.
- Service role key yalnızca server environment’ında bulunur.
- Production’da Supabase Storage eksikse upload reddedilir.
- `CORS_ORIGINS` wildcard ve credential birlikte kullanılmaz.
- Cookie production’da `Secure`, `HttpOnly` ve `SameSite=Lax` kullanır.
- Kullanıcıdan gelen metinler escape edilir; medya URL’leri yalnızca trusted storage adapter’dan gelir.

## Teslim sırası

1. Audit ve kabul kriterleri.
2. CSS/JS çakışmalarının temizlenmesi.
3. Public discovery ve sipariş deneyimi.
4. Admin tam CRUD ve medya lifecycle.
5. API/error/health testleri.
6. Responsive ve canlı deploy doğrulaması.
