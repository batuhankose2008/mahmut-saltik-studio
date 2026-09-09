import os
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required")


@contextmanager
def connection() -> Iterator[psycopg.Connection]:
    conn = psycopg.connect(DATABASE_URL, row_factory=dict_row, sslmode="require")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_database() -> None:
    with connection() as conn:
        conn.execute("CREATE TABLE IF NOT EXISTS _schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())")
        migration_dir = Path(__file__).resolve().parent.parent / "migrations"
        for migration in sorted(migration_dir.glob("*.sql")):
            version = migration.name
            already_applied = conn.execute("SELECT 1 FROM _schema_migrations WHERE version = %s", (version,)).fetchone()
            if already_applied:
                continue
            conn.execute(migration.read_text(encoding="utf-8"))
            conn.execute("INSERT INTO _schema_migrations (version) VALUES (%s)", (version,))


def query_one(sql: str, params: tuple = ()):
    with connection() as conn:
        return conn.execute(sql, params).fetchone()


def query_all(sql: str, params: tuple = ()):
    with connection() as conn:
        return conn.execute(sql, params).fetchall()


def execute(sql: str, params: tuple = ()):
    with connection() as conn:
        return conn.execute(sql, params)
