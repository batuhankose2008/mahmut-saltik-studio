# Instagram kapsam QA — 2026-09-10

Bağlı tarayıcıdaki `@mahmut_saltik` profili canlı olarak açıldı. Profilde 514 gönderi, 1.230 takipçi ve 1.223 takip bilgisi görünüyor. Profil biyografisi sitedeki profile aktarılan metinle eşleşiyor. Sayfada 14 adet aynı isimle görünen “Öne Çıkanlar” erişim noktası ve gönderiler/reels sekmeleri mevcut.

Canlı DOM’dan o anda tarayıcıya sunulan 59 benzersiz görsel URL’si çıkarılabildi. Bunların bir bölümü gerçek gönderi veya highlight medyası, bir bölümü Instagram arayüz ikonları ve düşük çözünürlüklü thumbnail’lar. Bu nedenle ikonları eser diye arşive aktarmamak gerekiyor. Profil HTML’i tek başına 514 gönderinin tamamını veya highlight hikâyelerinin tüm karelerini sunmuyor; bunlar sayfa içinde ayrı ayrı açılıp/scroll edilerek yüklenebiliyor.

İlk öne çıkan ayrı bir story viewer olarak açıldı (`stories/highlights/18111401575918975`). Viewer’da medya yükleme göstergesi ve video ses kontrolleri göründü; içerik sayfa profil HTML’inden ayrı ve tek tek açılarak yükleniyor. Bu nedenle tüm highlight karelerini profil HTML’inden otomatik olarak iddia etmek doğru değil; story viewer içeriği ayrıca dolaşılmalı.
