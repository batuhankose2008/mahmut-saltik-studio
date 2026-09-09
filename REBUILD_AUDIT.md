# Mahmut Saltık Studio — Yeniden Kurulum Denetim Raporu

## Sonuç

Önceki çalışma işlevlerin bir bölümünü eklemiş olsa da profesyonel ürün standardına ulaşmadı. Temel sorun, tasarım, veri modeli, CMS ve dağıtım akışının tek bir ürün planı altında tasarlanmamasıydı. Arayüz art arda eklenen CSS ve HTML parçalarıyla büyüdü; bu nedenle canlıda çalışan ancak görsel bütünlüğü olmayan bir uygulama oluştu.

Bu yeniden kurulumda hedef; **açık temalı, içerik olmadan da boş görünmeyen, içerik yüklendiğinde düzenli büyüyen, modüler bir sanatçı platformu** oluşturmaktır.

## 1. Hatalı giden süreç

### 1.1 Gereksinimlerin kabul kriterlerine çevrilmemesi

Kullanıcının istediği yapı “Instagram kopyası” değil, Instagram’ın keşif kolaylığını alan bir sanatçı profiliydi. Önceki süreçte bu istek doğrudan bileşen ve CSS parçalarına çevrildi. Kabul kriterleri yazılmadığı için “profil görünümü”, “galeri akışı”, “admin içerik yönetimi” ve “sipariş iletişimi” ayrı ayrı geliştirilmiş, birlikte test edilmemiştir.

### 1.2 Aynı dosyaların art arda yamalanması

`static/styles.css`, `static/app.js` ve `static/admin.js` birden fazla tasarım denemesinin üst üste eklenmesiyle büyüdü. Aynı değişkenler ve aynı bileşen adları tekrar tanımlandı. Bazı seçiciler satır kırılması nedeniyle geçersiz hâle geldi. Sonuç olarak kaynakta yeni tasarım varmış gibi görünürken canlı sayfa eski veya parçalı stiller gösterebildi.

### 1.3 “Tamamlandı” iddiasının canlı doğrulama yapılmadan verilmesi

GitHub commit’i ile Render deploy’u birbirinden ayrıdır. Önceki süreçte commit gönderilmesi canlı deploy ile karıştırıldı. Canlı URL, commit hash ve asset marker birlikte kontrol edilmeden özelliklerin hazır olduğu söylendi. Yeniden kurulumda her teslim için şu üçlü zorunlu olacaktır: **commit hash, canlı health check, canlı HTML/CSS marker**.

### 1.4 İçerik modeli ile boş durum deneyiminin karıştırılması

Veritabanında gerçek eser ve günlük içeriği yokken public sayfa boş kaldı. Demo içerik eklemek doğru değildi; ancak boş alanların ürün tasarımı olarak ele alınması gerekiyordu. Yeniden kurulumda onboarding ve editoryal empty state kullanılacak; sahte eser üretilmeyecektir.

### 1.5 Admin CMS’in tam CRUD olmaması

Eserler için düzenleme ve silme akışı bulunurken journal ve social archive kayıtlarında tam düzenleme deneyimi eksikti. Medya, metadata, yayın durumu ve sıra yönetimi tek bir tutarlı editör formunda ele alınmamıştı.

### 1.6 Storage risklerinin yeterince sınırlandırılmaması

Supabase Storage doğru yönde bağlandı; fakat local fallback davranışı Render gibi ephemeral disk kullanan bir ortamda ürün davranışı olarak bırakılmamalıdır. Production ortamı Storage yapılandırılmamışsa yükleme durmalı ve açıklayıcı hata vermelidir. Dosya tipi, boyut, içerik türü ve orphan media temizliği de sistematik olmalıdır.

### 1.7 Güvenlik ve operasyon eksikleri

Admin login için rate limit, güvenlik olayları, kontrollü CORS ve daha net production env doğrulaması bulunmuyor. Service role key yalnızca backend’de tutulmalı, yanlış Supabase REST URL’si normalleştirilmeli ve production’da eksik env ile uygulama sessizce çalışmamalıdır.

## 2. Yeniden kurulum kabul kriterleri

| Alan | Kabul kriteri |
|---|---|
| Public profil | Açık tema, mobil uyum, güçlü ilk ekran, gerçek içerik yokken dahi düzenli empty state |
| Galeri | Arama, kategori filtresi, sıralama, video preview, detay modalı, eser kodu ve iletişim CTA’sı |
| Studio Journal | Görsel/video/metin içerik, yayın durumu, öne çıkarma ve sıra yönetimi |
| Social Archive | Instagram’a bağlı olmayan manuel arşiv, post/video/highlight türleri, sıralı akış |
| Sipariş | Ödeme yok; WhatsApp hazır mesaj, Instagram kullanıcı adı + clipboard fallback |
| Yorum | MS-XXXXXX doğrulaması, kullanıcı adıyla yorum, admin onayı/silme |
| Admin | Login, dashboard özetleri, tam CRUD, önizleme, yayın/taslak, sıra yönetimi |
| Storage | Supabase Storage production zorunlu, kalıcı URL, silmede medya temizliği |
| Güvenlik | Admin-only endpoint kontrolü, kontrollü CORS, secure cookie, env doğrulaması |
| QA | Unit/API testleri, JS syntax, canlı health check, deploy commit doğrulaması |

## 3. Yeni mimari

Uygulama üç katmana ayrılacaktır:

1. **Domain/API:** FastAPI route modülleri, Pydantic modelleri ve auth dependency’leri.
2. **Persistence/Storage:** PostgreSQL repository fonksiyonları ve Supabase Storage adapter’ı.
3. **Presentation:** Public ve admin için ayrı, küçük frontend modülleri; ortak design token ve erişilebilir UI yardımcıları.

Mevcut FastAPI ve PostgreSQL altyapısı korunabilir; ancak `main.py` yalnızca uygulama fabrikası ve router kayıtlarını içermelidir. İçerik türleri için `artworks`, `journal_entries`, `social_archive`, `reviews` ve `site_profile` tabloları migration’larla yönetilecektir.

## 4. Gerekli kullanıcı bilgileri

Kodlamaya başlamak için yeni bir gizli bilgiye ihtiyaç yoktur. Aşağıdakiler yeterlidir:

- Supabase proje URL’si.
- Supabase service role key’in Render environment variable olarak tanımlanması.
- Supabase Storage bucket adı ve public politikası.
- WhatsApp numarası.
- Instagram kullanıcı adı veya tam profil bağlantısı.
- Gerçek profil fotoğrafı, eser görselleri ve videoları.
- Render’ın GitHub branch’ine otomatik deploy ayarı.

Instagram gönderilerini otomatik ve hukuka uygun çekmek için ayrıca Instagram Graph API yetkilendirmesi gerekir. Bu olmadan Instagram’dan veri scrape edilmeyecek; arşiv admin panelinden manuel yönetilecektir.

## 5. Dağıtım doğrulama protokolü

Her release sonrasında:

1. GitHub commit hash alınır.
2. Render deploy log’unda aynı commit doğrulanır.
3. `/api/health` kontrol edilir.
4. `/api/config` gizli değer sızdırmadan beklenen yapılandırmayı döndürür.
5. Public HTML ve CSS’te release marker kontrol edilir.
6. Admin login, upload, publish, public fetch, delete ve restart senaryoları denenir.

Bu rapor, yeniden kurulumun temel teknik sözleşmesidir.
