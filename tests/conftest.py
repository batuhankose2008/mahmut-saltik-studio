import os

# Birim testleri canlı veritabanına bağlanmadan import edilebilmeli. Test süreci,
# sandbox'taki olası MySQL/TiDB DATABASE_URL değerini bilinçli olarak gölgeler.
os.environ["DATABASE_URL"] = "postgresql://test:test@localhost:5432/test"
os.environ.setdefault("JWT_SECRET", "test-secret-for-unit-tests")
