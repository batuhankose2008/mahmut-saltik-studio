# Mahmut Saltık Studio

Kişiye özel portre ve çizim çalışmalarını sergilemek, ziyaretçileri WhatsApp veya Instagram üzerinden iletişime yönlendirmek ve içerikleri teknik olmayan bir admin panelinden yönetmek için geliştirilmiş full-stack portfolyo uygulaması.

> Bu proje, gerçek bir sanatçı için hazırlanmış gerçek bir ürün çalışmasıdır. Site üzerinden ödeme alınmaz; satış, fiyat ve teslimat görüşmeleri doğrudan iletişim kanallarında yürütülür.

## Proje özeti

Mahmut Saltık Studio; karakalem, yağlı boya, renkli, dijital ve video içeriklerini tek bir kişisel vitrinde toplar. Ziyaretçi eserleri filtreleyebilir, ayrıntılı olarak inceleyebilir, favorilerine ekleyebilir ve hazır WhatsApp/Instagram mesajlarıyla iletişime geçebilir. Yönetici ise eserleri, biyografiyi, atölye notlarını ve müşteri yorumlarını `/admin` panelinden yönetir.

Uygulama, Render’ın kalıcı olmayan dosya sistemine bağımlı kalmamak için görsel ve video dosyalarını Supabase Storage’a aktarır. PostgreSQL verisi Supabase’te, medya dosyaları `artworks` bucket’ında tutulur.

## Özellikler

### Ziyaretçi deneyimi

- Responsive ve tipografi odaklı sanatçı portfolyosu.
- Eser kategorilerine göre filtrelenebilir galeri.
- Görsel lightbox ve video oynatıcı.
- Eser başlığı, teknik, ölçü, açıklama, fiyat etiketi ve benzersiz `MS-XXXXXX` kodu.
- LocalStorage tabanlı eser sepeti.
- WhatsApp’a eser kodlarıyla hazır mesaj gönderme.
- WhatsApp yapılandırılmamışsa mesajı clipboard’a kopyalayıp Instagram’a yönlendirme.
- Kişiye özel çizim talebi formu.
- Karakalem, yağlı boya, renkli, evcil hayvan ve dijital çizim seçenekleri.
- Oturum açmış müşteriler için referans fotoğrafı yükleme.
- E-posta/şifre müşteri üyeliği.
- Favoriye ekleme.
- Satın alma koduyla yorum ve 1–5 puan gönderme.
- Admin onayından geçen yorumları görüntüleme.
- SEO meta bilgileri, favicon, `robots.txt` ve `sitemap.xml`.
- Gizlilik ve kullanım koşulları sayfaları.

### Admin paneli

- Şifre korumalı `/admin` girişi.
- Görsel veya video yükleme.
- Eser düzenleme, yayınlama/gizleme ve silme.
- Öne çıkarma ve sıra numarasıyla galeri düzenleme.
- Profil adı, başlık, biyografi, konum ve Instagram bağlantısı yönetimi.
- Instagram’ı taklit etmeyen bağımsız Stüdyo Günlüğü.
- Günlük notuna metin, fotoğraf veya video ekleme.
- Günlük kaydını öne çıkarma, yayınlama/gizleme ve silme.
- Müşteri yorumlarını onaylama veya silme.
- Açıklayıcı hata mesajları ve kullanıcı dostu toast bildirimleri.

## Teknoloji

| Katman | Kullanılan teknoloji |
|---|---|
| Backend | Python, FastAPI, Uvicorn |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Veritabanı | PostgreSQL, Supabase |
| Medya depolama | Supabase Storage |
| Kimlik doğrulama | HttpOnly cookie, JWT, scrypt parola özeti |
| Dağıtım | Docker, Render |
| Test | Pytest, Node syntax check |

## Dizin yapısı

```text
.
├── app/
│   ├── auth.py       # Parola hash, JWT ve cookie oturumları
│   ├── db.py         # PostgreSQL bağlantısı ve migration runner
│   └── main.py       # FastAPI uygulaması ve endpointler
├── migrations/
│   ├── 001_initial.sql
│   ├── 002_media_metadata.sql
│   └── 003_profile_and_journal.sql
├── static/
│   ├── index.html    # Public site
│   ├── admin.html    # Admin shell
│   ├── app.js        # Public etkileşimleri
│   ├── admin.js      # Admin etkileşimleri
│   ├── styles.css
│   └── uploads/      # Yalnızca local fallback; canlı medya burada tutulmaz
├── tests/
├── Dockerfile
├── render.yaml
├── schema.sql
├── requirements.txt
└── .env.example
```

## Environment değişkenleri

`.env.example` yalnızca örnektir. Gerçek secret değerlerini GitHub’a göndermeyin.

| Değişken | Gerekli | Açıklama |
|---|---:|---|
| `DATABASE_URL` | Evet | Supabase PostgreSQL URI bağlantısı. |
| `JWT_SECRET` | Evet | Oturum token’larını imzalamak için uzun rastgele değer. |
| `ADMIN_PASSWORD` | Evet | `/admin` giriş şifresi. |
| `WHATSAPP_NUMBER` | Evet | Ülke koduyla, boşluksuz telefon numarası. |
| `INSTAGRAM_USERNAME` | Evet | `@` işareti olmadan kullanıcı adı. |
| `SUPABASE_URL` | Storage için | `https://PROJECT_REF.supabase.co`; sonunda `/rest/v1/` bulunmaz. |
| `SUPABASE_SERVICE_ROLE_KEY` | Storage için | Legacy service role anahtarı. Yalnızca backend/Render secret alanında tutulur. |
| `SUPABASE_SECRET_KEY` | Alternatif | Yeni Supabase secret key sistemi kullanılıyorsa service role yerine kullanılabilir. |
| `SUPABASE_STORAGE_BUCKET` | Storage için | Varsayılan değer `artworks`. |
| `COOKIE_SECURE` | Canlıda evet | HTTPS ortamında `true`, local geliştirmede `false`. |

### Storage kurulumu

Supabase panelinde şu işlemleri yapın:

```text
Storage → New bucket → Name: artworks → Public bucket: açık → Create bucket
```

Render Environment alanında Storage için şu değişkenler bulunmalıdır:

```text
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_STORAGE_BUCKET=artworks
SUPABASE_SERVICE_ROLE_KEY=<server-only-key>
```

Yeni Supabase secret key kullanılıyorsa son satır yerine şu kullanılabilir:

```text
SUPABASE_SECRET_KEY=<server-only-key>
```

Service role veya secret key hiçbir zaman frontend’e, GitHub’a, ZIP’e, README’ye veya tarayıcıya gönderilmez.

## Instagram gönderi arşivini toplu aktarma

Instagram hesabının sahibi, kendi hesabıyla [Accounts Center → Bilgilerini dışa aktar](https://accountscenter.instagram.com/info_and_permissions/dyi/) ekranına girerek Instagram profilini seçmelidir. Veri aralığı **Tüm zamanlar**, format **JSON** ve medya kalitesi mümkün olan en yüksek değer seçilmelidir. Hazırlanan ZIP dosyası indirildikten sonra gerçek admin şifresi komut satırında kullanılarak import aracı çalıştırılır:

```bash
python tools/import_instagram_export.py instagram-export.zip \
  --base-url https://mahmut-saltik-studio.onrender.com \
  --admin-password '<ADMIN_PASSWORD>'
```

Önce yalnızca dosya sayısını görmek için güvenli deneme modu kullanılabilir:

```bash
python tools/import_instagram_export.py instagram-export.zip \
  --admin-password '<ADMIN_PASSWORD>' \
  --dry-run
```

Araç ZIP yol traversal kontrolü yapar, görsel/video dosyalarını JSON sırasına göre işler, mevcut Storage kayıtlarını içerik hash’iyle tekrar kontrol eder ve her dosyayı admin API üzerinden Supabase Storage ile PostgreSQL’e kaydeder. ZIP dosyasını, admin şifresini veya service role anahtarını GitHub’a göndermeyin. Instagram export’unda başkasının paylaştığı, silinmiş veya yalnızca özel viewer içinde kalan içerikler bulunmayabilir; aktarım sonucu admin panelinden silinebilir veya gizlenebilir.

## Yerel geliştirme

Python 3.12 veya üzeri önerilir.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

`.env` içindeki değerleri doldurduktan sonra uygulamayı çalıştırın:

```bash
uvicorn app.main:app --reload
```

Public site:

```text
http://localhost:8000
```

Admin paneli:

```text
http://localhost:8000/admin
```

İlk başlangıçta migration runner, `migrations/` klasöründeki SQL dosyalarını sıralı biçimde uygular ve `_schema_migrations` tablosunda takip eder. Aynı migration ikinci kez çalıştırılmaz.

## Render dağıtımı

1. Repository’yi GitHub’a yükleyin. Gerçek `.env` dosyasını yüklemeyin.
2. Render’da **New → Web Service** seçin.
3. GitHub repository’sini bağlayın.
4. Runtime olarak Docker seçin veya repository’deki `render.yaml` Blueprint’ini kullanın.
5. Render Environment alanına `DATABASE_URL`, `JWT_SECRET`, `ADMIN_PASSWORD`, `WHATSAPP_NUMBER`, `INSTAGRAM_USERNAME` ve Storage değişkenlerini ekleyin.
6. Deploy işlemini başlatın.
7. Deploy sonrası `/api/health` endpointini kontrol edin.

Storage’ın hazır olduğuna dair beklenen cevap:

```json
{
  "ok": true,
  "storage": "supabase",
  "storage_configured": true,
  "storage_bucket": "artworks"
}
```

`storage_configured` değeri `false` ise Supabase URL’si veya server-only anahtar eksiktir. Render’ın local diskine güvenmeyin; canlı medya dosyaları Supabase Storage’da bulunmalıdır.

## Test ve kalite kontrolü

```bash
python -m pytest -q
python -m compileall app
node --check static/app.js
node --check static/admin.js
```

Testler parola/JWT akışını, müşteri kodu doğrulamasını, migration sırasını, profil ve günlük modellerini, Storage URL normalizasyonunu ve yeni secret key fallback’ini kontrol eder.

## API özeti

| Method | Endpoint | Amaç |
|---|---|---|
| `GET` | `/api/health` | Veritabanı ve Storage durumunu gösterir. |
| `GET` | `/api/artworks` | Public eserleri listeler. |
| `POST` | `/api/admin/artworks` | Admin eseri ve medyayı yükler. |
| `PATCH` | `/api/admin/artworks/{id}` | Eseri günceller. |
| `GET` | `/api/profile` | Public profil bilgisini döndürür. |
| `PATCH` | `/api/admin/profile` | Admin profilini günceller. |
| `GET` | `/api/journal` | Yayındaki günlük kayıtlarını döndürür. |
| `POST` | `/api/admin/journal` | Admin günlük kaydı oluşturur. |
| `POST` | `/api/commission/reference` | Oturum açmış müşterinin referans görselini yükler. |
| `POST` | `/api/reviews` | Müşteri koduyla yorum gönderir. |
| `GET` | `/api/admin/reviews` | Admin yorum moderasyon listesini açar. |

## Güvenlik notları

Service role ve secret key’ler Row Level Security’yi aşabilecek yetkili server-side anahtarlardır. Bu nedenle yalnızca Render Environment alanında tutulmalıdır. Public API, `include_unpublished=true` isteğini admin oturumu olmadan `403` ile reddeder. Parolalar düz metin olarak değil, scrypt tabanlı özet olarak saklanır. Oturum cookie’si HttpOnly olarak ayarlanır.

## Tasarım yaklaşımı

Arayüz, genel amaçlı bir sosyal medya klonu olmak yerine kişisel bir sanatçı portfolyosu olarak tasarlanmıştır. Koyu mürekkep arka plan, kâğıt tonları, serif başlıklar ve kontrollü hareketler eserleri öne çıkarır. Stüdyo Günlüğü, Instagram’dan bağımsız olarak sanatçının kendi seçtiği içerikleri yayınladığı özgün bir içerik katmanıdır.

## Sınırlar

Uygulama bu sürümde ödeme almaz, sipariş durumlarını ticari bir panelde takip etmez ve Instagram içeriklerini otomatik olarak kopyalamaz. Fiyat, teslimat, ödeme ve sipariş ayrıntıları WhatsApp veya Instagram görüşmesinde belirlenir.

## Lisans

Bu repository, Mahmut Saltık Studio portfolyo projesi için hazırlanmıştır. Lisans koşulları proje sahibi tarafından ayrıca belirlenmelidir.
