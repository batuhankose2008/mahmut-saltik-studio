# Database migrations

Render başlarken `app/db.py` migration klasöründeki SQL dosyalarını alfabetik sırayla çalıştırır ve `_schema_migrations` tablosuna kaydeder. Yeni bir değişiklik için sıradaki numaralı SQL dosyasını eklemek yeterlidir.

Supabase SQL Editor ile ilk kurulum yapılacaksa `schema.sql` çalıştırılabilir. Uygulama sonraki açılışlarda migration kaydını kontrol ederek aynı dosyayı tekrar çalıştırmaz.
