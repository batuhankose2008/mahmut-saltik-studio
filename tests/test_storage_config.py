import os

os.environ.setdefault("JWT_SECRET", "test-secret-for-storage-tests")
os.environ.setdefault("DATABASE_URL", "postgresql://unused")

from app.main import storage_settings


def test_storage_settings_normalizes_rest_url_and_bucket(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co/rest/v1/")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "service-key")
    monkeypatch.setenv("SUPABASE_STORAGE_BUCKET", "artworks")
    assert storage_settings() == ("https://example.supabase.co", "service-key", "artworks")


def test_storage_settings_accepts_new_secret_key_name(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)
    monkeypatch.setenv("SUPABASE_SECRET_KEY", "sb_secret_test")
    monkeypatch.delenv("SUPABASE_STORAGE_BUCKET", raising=False)
    assert storage_settings() == ("https://example.supabase.co", "sb_secret_test", "artworks")
