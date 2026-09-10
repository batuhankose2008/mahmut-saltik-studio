# Instagram grid crawl — 2026-09-10

Bağlı tarayıcıdaki Mahmut Saltık profilinde 514 gönderi görünüyor. Profil yeniden açıldı, gönderi gridinde aşağı kaydırıldı ve gerçek çalışma görsellerinin dinamik olarak yüklendiği doğrulandı. İlk scroll sonrası kara kalem portreler, çift portresi, sergi duyurusu, otomobil çizimi, yağlıboya ve kuş çalışması gibi yeni gönderiler göründü. Sayfa sonuna kaydırıldığında daha eski gönderiler ve etkinlik/fotoğraf içerikleri de yüklendi; Instagram, gridin sonunda yükleme göstergesi bıraktı.

Profil sayfasının ilk HTML görünümü yalnızca ilk bölüm medyasını verir. Tüm 514 gönderinin tamamı için sayfayı dinamik olarak daha fazla yükletmek ve her yüklemeden sonra DOM’u kaydetmek gerekir. Story/highlight içerikleri ise ayrı viewer akışındadır.

## Sonuç

Canlı sitede “Tüm Çalışmalar” bölümü oluşturuldu ve public API’de 30 medya kaydı doğrulandı. Tarayıcı önizlemesinde bölüm başlığı, `30 GÖNDERİ` sayacı ve her gönderinin görsel kartı görüldü. İlk grid taraması 12 yeni içerik daha buldu; bunlar tekrarları içerik hash’iyle ayıklanarak Supabase Storage’a aktarıldı.

Instagram toplam profil sayısı 514 olarak görünse de, bağlı tarayıcının o oturumda lazy-load ile sunduğu ve indirilebilir biçimde alınabilen bölüm 30 benzersiz gönderiyle sınırlı kaldı. Sayfanın sonunda Instagram yükleme göstergesi kaldı ve yeni DOM medya kaydı sunmadı. Bu nedenle kalan 484 gönderiyi eklenmiş gibi göstermedim. Hepsini gerçek anlamda otomatik senkronize etmek için Instagram Graph API veya Instagram’dan dışa aktarılmış medya arşivi gerekir.
