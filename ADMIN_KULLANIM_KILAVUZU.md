# Mahmut Saltık Studio — Admin Paneli Kullanım Kılavuzu

Bu kılavuz, Mahmut Saltık Studio web sitesinin yönetim panelini teknik bilgi gerektirmeden kullanabilmeniz için hazırlanmıştır. Yönetim panelinden eserlerinizi, profil bilgilerinizi, Stüdyo Günlüğü yazılarınızı ve müşteri yorumlarını yönetebilirsiniz.

## 1. Yönetim paneline giriş

Yönetim paneli, sitenizin adresinin sonuna `/admin` eklenerek açılır.

```text
https://sitenizin-adresi.com/admin
```

Açılan ekranda **Güvenlik şifresi** alanına size verilen yönetici şifresini yazın ve **Panele gir** düğmesine basın. Şifreyi doğru girdiğinizde yönetim ekranı açılır.

> Yönetici şifrenizi ziyaretçilerle paylaşmayın. Şifrenizi kaybederseniz siteyi kuran kişiden veya Render yönetim ayarlarından destek alın.

## 2. Yönetim ekranının bölümleri

Panelin sol tarafında şu bölümler bulunur:

| Bölüm | Ne işe yarar? |
|---|---|
| **Eserler** | Yüklenmiş eserleri görmenizi, düzenlemenizi, gizlemenizi veya silmenizi sağlar. |
| **Yeni yükleme** | Yeni çizim veya video eklemek için kullanılır. |
| **Yorumlar** | Müşterilerin gönderdiği yorumları onaylamanızı veya silmenizi sağlar. |
| **Stüdyo Günlüğü** | Çizim süreci, atölye notu, fotoğraf ve video paylaşmanızı sağlar. |
| **Profil** | Ana sayfadaki ad, biyografi, başlık, konum ve Instagram bağlantısını düzenler. |
| **Kurulum notları** | Sitenin temel kullanım mantığını hatırlatır. |

## 3. Yeni eser yükleme

Yeni bir çizim veya video eklemek için sol menüden **Yeni yükleme** bölümüne girin.

Formdaki alanları şu şekilde doldurun:

| Alan | Açıklama |
|---|---|
| **Eser adı** | Eserin ziyaretçilere görünecek adı. Örnek: `Sessiz Bakış`. |
| **Kategori** | Karakalem, Yağlı Boya, Renkli, Dijital veya Video seçeneklerinden biri. |
| **Teknik** | Eserde kullandığınız teknik. Örnek: `Grafit ve kömür`. |
| **Boyut** | Eserin ölçüsü. Örnek: `35 × 50 cm`. |
| **Fiyat etiketi** | Fiyat göstermek istemiyorsanız `Bilgi için iletişim` yazabilirsiniz. |
| **Açıklama** | Eserin kısa hikâyesi, kullanılan teknik veya müşteriye iletmek istediğiniz bilgi. |
| **Görsel veya video dosyası** | JPG, PNG, WEBP, MP4 veya WEBM dosyası. Dosya en fazla 100 MB olabilir. |

Formu doldurduktan sonra **Eseri yayınla** düğmesine basın. Sistem esere otomatik olarak `MS-XXXXXX` biçiminde bir müşteri kodu verir.

Bu kodu eserle birlikte müşteriye iletmeniz önemlidir. Müşteri daha sonra bu kodu kullanarak eser hakkında yorum gönderebilir.

### Dosya yükleme önerileri

Görselleri mümkünse yüksek kaliteli fakat gereksiz yere çok büyük olmayan dosyalar olarak yükleyin. Portre görsellerinde dosya adının önemi yoktur; sistem dosyayı kendi güvenli adıyla kaydeder. Video yüklerken MP4 formatı en uyumlu seçenektir.

## 4. Eser düzenleme, gizleme ve silme

**Eserler** bölümünde tüm eserleriniz listelenir. Her eserin yanında **Düzenle** ve **Sil** düğmeleri bulunur.

**Düzenle** düğmesiyle eser adı, kategori, teknik, ölçü, fiyat etiketi ve açıklama değiştirilebilir. **Bu eseri sitede yayınla** seçeneğinin işaretini kaldırırsanız eser silinmez; yalnızca ziyaretçilere görünmez.

Sıra numarası, eserlerin galerideki sırasını düzenlemek için kullanılabilir. Daha küçük sıra numarası daha önce gösterilir.

**Sil** düğmesi eseri ve ona bağlı yorumları kaldırabilir. Bu işlem geri alınamayacağı için yalnızca artık tutulmasını istemediğiniz eserlerde kullanın. Eseri geçici olarak kaldırmak istiyorsanız silmek yerine yayınını gizleyin.

## 5. Profil bilgilerini düzenleme

Sol menüden **Profil** bölümünü açın. Buradaki bilgiler ana sayfanın hikâye bölümünde görünür.

- **İsim:** Sitede görünecek sanatçı adı.
- **Başlık:** Örneğin `Çizgi, bir izdir.`
- **Biyografi:** Sanatçının ne yaptığı, hangi tür çizimler ürettiği ve müşteriye yaklaşımı.
- **Konum:** Örneğin `İstanbul / TR`.
- **Instagram profil bağlantısı:** Instagram hesabının tam bağlantısı.

Değişiklikleri yaptıktan sonra **Profili kaydet** düğmesine basın. Siteyi yeni sekmede açarak sonucu kontrol edebilirsiniz.

## 6. Stüdyo Günlüğü kullanımı

**Stüdyo Günlüğü**, Instagram’ın kopyası değildir. Hocanın kendi seçtiği atölye notlarını ve üretim sürecini site içinde yayınladığı bağımsız bir bölümdür.

Yeni bir günlük kaydı eklemek için **Stüdyo Günlüğü** bölümünü açın ve şu alanları doldurun:

- **Başlık:** Kısa ve doğal bir başlık. Örnek: `Bugün grafit biraz daha sessizdi.`
- **Not:** Çizimin veya atölye sürecinin hikâyesi.
- **Fotoğraf / video:** İsteğe bağlı medya dosyası.
- **Günlüğün başında öne çıkar:** Bu notun günlük bölümünde daha görünür olmasını sağlar.

**Günlüğe ekle** düğmesine bastığınızda not yayınlanır. Daha sonra aynı bölümden notu gizleyebilir veya silebilirsiniz.

## 7. Müşteri yorumlarını yönetme

Müşteri, aldığı eserin yanında verilen `MS-XXXXXX` kodunu kullanarak yorum gönderir. Yorumlar doğrudan sitede görünmez; önce yönetim panelindeki **Yorumlar** bölümüne düşer.

Bir yorumu yayınlamak için **Onayla** düğmesine basın. Uygunsuz, yanlış veya spam olduğunu düşündüğünüz bir yorumu **Sil** düğmesiyle kaldırabilirsiniz.

Yorumlar gerçek müşteri adıyla yayınlanır. Bu nedenle yorumları onaylamadan önce metni kontrol etmeniz önerilir.

## 8. Müşteriye özel çizim talebi

Ziyaretçi ana sayfadaki **Özel çizim** veya **Bana bir çizim yap** düğmesine basarak talep formunu açar.

Müşteri:

1. Çizim türünü seçer.
2. İstediği çalışmayı açıklar.
3. İsteğe bağlı olarak referans fotoğrafı ekler.
4. Hazır mesajla WhatsApp’a veya Instagram’a yönlenir.

Sitede ödeme alınmaz. Fiyat, teslimat ve çizim detaylarını WhatsApp veya Instagram konuşmasında siz belirlersiniz.

## 9. Hazır eser sepeti

Ziyaretçi beğendiği eserleri sepete ekler. Sepet tarayıcıda saklanır ve ödeme sistemi içermez.

Müşteri **WhatsApp’tan konuş** düğmesine bastığında eser adları ve MS kodları hazır bir mesaj olarak açılır. WhatsApp numarası yapılandırılmamışsa mesaj kopyalanır ve Instagram profiline yönlendirme yapılır.

## 10. Sık karşılaşılan hata mesajları

| Mesaj | Ne yapmalısınız? |
|---|---|
| **E-posta veya şifre hatalı** | E-posta ve şifreyi tekrar kontrol edin. |
| **Yönetici şifresi hatalı** | Admin şifresini tekrar yazın; sorun sürerse site yöneticisinden yardım isteyin. |
| **Dosya türü desteklenmiyor** | JPG, PNG, WEBP, MP4 veya WEBM kullanın. |
| **Dosya çok büyük** | Dosyayı 100 MB’ın altına indirin. |
| **Supabase Storage ayarları eksik** | Teknik kurulumu yapan kişiye haber verin. Render ortam değişkenleri kontrol edilmelidir. |
| **Bu işlem için yetkiniz yok** | Admin hesabıyla giriş yaptığınızdan emin olun. |
| **Sunucu kısa süreliğine yanıt veremedi** | Birkaç saniye bekleyip sayfayı yenileyin. |

## 11. Güvenli kullanım önerileri

Admin şifresini mesaj gruplarında veya herkese açık belgelerde paylaşmayın. Eserlerinizi geçici olarak kaldırmak için silme işlemi yerine yayın durumunu gizleyin. Çok büyük video dosyaları yüklemeyin. Müşterilerin yorumlarını yayınlamadan önce okuyun. Site üzerinden ödeme alınmadığı için müşterilerle fiyat ve teslimat bilgisini WhatsApp veya Instagram görüşmesinde netleştirin.

## 12. Günlük kullanım özeti

Yeni bir çizim eklemek için **Yeni yükleme → Formu doldur → Dosyayı seç → Eseri yayınla** sırasını izleyin. Biyografi veya Instagram bağlantısını değiştirmek için **Profil → Alanları düzenle → Profili kaydet** adımlarını kullanın. Atölye süreci paylaşmak için **Stüdyo Günlüğü → Yeni günlük kaydı → Günlüğe ekle** yolunu izleyin. Müşteri yorumları için **Yorumlar → Onayla veya Sil** seçeneklerini kullanın.

## Kaynaklar

Bu belge, projenin kendi `README.md`, `schema.sql` ve admin paneli akışına göre hazırlanmıştır.
