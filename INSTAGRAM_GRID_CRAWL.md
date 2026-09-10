# Instagram grid crawl — 2026-09-10

Bağlı tarayıcıdaki Mahmut Saltık profilinde 514 gönderi görünüyor. Profil yeniden açıldı, gönderi gridinde aşağı kaydırıldı ve gerçek çalışma görsellerinin dinamik olarak yüklendiği doğrulandı. İlk scroll sonrası kara kalem portreler, çift portresi, sergi duyurusu, otomobil çizimi, yağlıboya ve kuş çalışması gibi yeni gönderiler göründü. Sayfa sonuna kaydırıldığında daha eski gönderiler ve etkinlik/fotoğraf içerikleri de yüklendi; Instagram, gridin sonunda yükleme göstergesi bıraktı.

Profil sayfasının ilk HTML görünümü yalnızca ilk bölüm medyasını verir. Tüm 514 gönderinin tamamı için sayfayı dinamik olarak daha fazla yükletmek ve her yüklemeden sonra DOM’u kaydetmek gerekir. Story/highlight içerikleri ise ayrı viewer akışındadır.
