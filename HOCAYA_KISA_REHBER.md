# Mahmut Saltık Studio — Proje Sahibi İçin Kısa Rehber

Bu belge, projeyi GitHub’a yükleyecek ve Render’da yayınlayacak **proje sahibi** için hazırlanmıştır. Mahmut Saltık’ın kendi GitHub hesabı veya yönetim bilgileri için hazırlanmış değildir.

## 1. Supabase Storage bucket oluşturma

Supabase projesini açın ve sol menüden şu yolu izleyin:

```text
Storage → New bucket
```

Bucket ayarlarında:

```text
Name: artworks
Public bucket: Açık
```

Ardından **Create bucket** düğmesine basın. Bucket listesinde tam olarak `artworks` görünmelidir.

Bu bucket, admin panelinden yüklenen çizim ve video dosyalarının Render’dan bağımsız, kalıcı olarak saklanacağı yerdir.

## 2. Render’da Storage değişkenlerini ekleme

Render servisinde:

```text
Web Service → Environment → Add Environment Variable
```

şu değişkenleri ekleyin:

```text
SUPABASE_URL=https://sdknbppoypbvzjxjwsty.supabase.co
SUPABASE_STORAGE_BUCKET=artworks
```

Bunlardan birini de ekleyin:

```text
SUPABASE_SERVICE_ROLE_KEY=Supabase’ten alınan yeni service role anahtarı
```

veya yeni Supabase anahtar sistemini kullanıyorsanız:

```text
SUPABASE_SECRET_KEY=Supabase’ten alınan yeni secret key
```

Gizli anahtarı GitHub’a, ZIP’e veya frontend dosyalarına koymayın.

## 3. Deploy sonrası kontrol

Render deploy tamamlandıktan sonra şu adresi açın:

```text
https://SIZIN-RENDER-ADRESIN.onrender.com/api/health
```

Doğru sonuç şu alanları içermelidir:

```json
{
  "ok": true,
  "storage": "supabase",
  "storage_configured": true,
  "storage_bucket": "artworks"
}
```

`storage_configured` değeri `false` ise Render environment değişkenlerinden biri eksik veya yanlış yazılmıştır.

## 4. Admin panelini test etme

Admin paneli:

```text
https://SIZIN-RENDER-ADRESIN.onrender.com/admin
```

Panelde:

1. **Yeni yükleme** bölümünü açın.
2. Bir JPG veya küçük MP4 dosyası seçin.
3. Eser bilgilerini doldurun.
4. **Eseri yayınla** düğmesine basın.
5. Ana sayfada eserin göründüğünü kontrol edin.
6. Supabase’te `Storage → artworks` bölümüne girip dosyanın oluştuğunu kontrol edin.

## 5. Projenin günlük kullanımı

- **Eserler:** Mevcut eserleri düzenleme, gizleme ve silme.
- **Yeni yükleme:** Yeni çizim veya video ekleme.
- **Yorumlar:** Müşteri koduyla gelen yorumları onaylama veya silme.
- **Stüdyo Günlüğü:** Çizim süreci ve atölye notları paylaşma.
- **Profil:** Site biyografisini ve Instagram bağlantısını değiştirme.

## 6. Önemli güvenlik notu

Supabase service role veya secret key çok güçlü bir sunucu anahtarıdır. Bu anahtar yalnızca Render Environment Variables alanında tutulmalıdır. GitHub repository’sine, README’ye, ZIP’e veya JavaScript dosyalarına eklenmemelidir.

## 7. İlk canlı test sırası

```text
[ ] Supabase’te artworks bucket oluşturuldu
[ ] Bucket public olarak ayarlandı
[ ] Render’a DATABASE_URL eklendi
[ ] Render’a JWT_SECRET eklendi
[ ] Render’a ADMIN_PASSWORD eklendi
[ ] Render’a SUPABASE_URL eklendi
[ ] Render’a SUPABASE_SERVICE_ROLE_KEY veya SUPABASE_SECRET_KEY eklendi
[ ] Render’a SUPABASE_STORAGE_BUCKET=artworks eklendi
[ ] /api/health sonucu storage_configured=true
[ ] Admin panelinden test görseli yüklendi
[ ] Dosya Supabase Storage’da göründü
[ ] Render yeniden deploy edildiğinde dosya kaybolmadı
```

Bu belge, GitHub portföyü için geliştirilen projenin sahibi olan kişi içindir. Mahmut Saltık’a gönderilecek ayrı bir kullanım metni hazırlanacaksa, o metin yalnızca admin panelinin günlük kullanımını anlatmalı ve Supabase, Render, API anahtarı veya GitHub ayrıntılarını içermemelidir.
