from pathlib import Path


def test_migrations_are_numbered_and_present():
    migrations = sorted((Path(__file__).parents[1] / "migrations").glob("*.sql"))
    assert [migration.name for migration in migrations] == [
        "001_initial.sql",
        "002_media_metadata.sql",
        "003_profile_and_journal.sql",
        "004_remove_assumed_profile_defaults.sql",
        "005_remove_demo_seed_content.sql",
        "006_social_archive.sql",
        "007_commission_requests.sql",
        "008_admin_security.sql",
    ]
    assert all(migration.read_text(encoding="utf-8").strip() for migration in migrations)
