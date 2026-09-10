#!/usr/bin/env python3
"""Instagram 'Bilgilerini indir' ZIP'ini Mahmut Saltık Studio arşivine aktarır.

Kullanım:
  python tools/import_instagram_export.py export.zip \
    --base-url https://mahmut-saltik-studio.onrender.com \
    --admin-password '...'

Betik medya dosyalarını doğrudan Supabase'e değil, mevcut admin API'ye gönderir.
Böylece Storage, veritabanı ve admin yetki kuralları aynı akıştan geçer.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import shutil
import tempfile
import zipfile
from pathlib import Path
from typing import Any

import requests

MEDIA_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".mp4", ".mov", ".webm"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Instagram export ZIP importer")
    parser.add_argument("zip_path", type=Path)
    parser.add_argument("--base-url", default="https://mahmut-saltik-studio.onrender.com")
    parser.add_argument("--admin-password", required=True)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    return parser.parse_args()


def safe_extract(archive: zipfile.ZipFile, target: Path) -> None:
    root = target.resolve()
    for member in archive.infolist():
        destination = (target / member.filename).resolve()
        if root not in destination.parents and destination != root:
            raise ValueError(f"Güvensiz ZIP yolu: {member.filename}")
    archive.extractall(target)


def media_files(root: Path) -> list[Path]:
    return sorted(
        (path for path in root.rglob("*") if path.is_file() and path.suffix.lower() in MEDIA_EXTENSIONS),
        key=lambda path: str(path).lower(),
    )


def json_media_order(root: Path) -> dict[str, int]:
    """Export JSON'larında görülen URI sırasını dosya adına bağlamaya çalışır."""
    order: dict[str, int] = {}
    position = 0
    for json_path in sorted(root.rglob("*.json")):
        try:
            payload: Any = json.loads(json_path.read_text(encoding="utf-8"))
        except (OSError, UnicodeDecodeError, json.JSONDecodeError):
            continue
        stack = [payload]
        while stack:
            item = stack.pop(0)
            if isinstance(item, dict):
                uri = item.get("uri") or item.get("media_uri") or item.get("path")
                if isinstance(uri, str):
                    order[Path(uri).name.lower()] = position
                    position += 1
                stack.extend(item.values())
            elif isinstance(item, list):
                stack.extend(item)
    return order


def digest(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def main() -> int:
    args = parse_args()
    if not args.zip_path.is_file():
        raise SystemExit(f"ZIP bulunamadı: {args.zip_path}")

    base_url = args.base_url.rstrip("/")
    with tempfile.TemporaryDirectory(prefix="mahmut-instagram-") as temp:
        root = Path(temp)
        with zipfile.ZipFile(args.zip_path) as archive:
            safe_extract(archive, root)

        files = media_files(root)
        order = json_media_order(root)
        files.sort(key=lambda path: (order.get(path.name.lower(), 10**9), str(path).lower()))
        if args.limit:
            files = files[: args.limit]
        print(f"Bulunan medya: {len(files)}")

        session = requests.Session()
        if not args.dry_run:
            login = session.post(f"{base_url}/api/admin/login", data={"password": args.admin_password}, timeout=60)
            login.raise_for_status()
            existing = session.get(f"{base_url}/api/admin/archive", timeout=60).json()
            existing_hashes: set[str] = set()
            for entry in existing:
                try:
                    response = session.get(entry["media_url"], timeout=30)
                    if response.ok:
                        existing_hashes.add(digest(response.content))
                except requests.RequestException:
                    continue
        else:
            existing_hashes = set()

        imported = 0
        skipped = 0
        for index, path in enumerate(files, start=1):
            content = path.read_bytes()
            file_hash = digest(content)
            if file_hash in existing_hashes:
                skipped += 1
                continue
            kind = "video" if path.suffix.lower() in {".mp4", ".mov", ".webm"} else "post"
            title = f"Mahmut Saltık / Instagram gönderisi {index:03d}"
            if args.dry_run:
                print(f"DRY-RUN {index:03d}: {path.name} ({len(content)} bytes)")
                imported += 1
                continue
            content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
            response = session.post(
                f"{base_url}/api/admin/archive",
                data={
                    "kind": kind,
                    "title": title,
                    "caption": "Instagram export arşivinden aktarılan gönderi.",
                    "sort_order": index,
                    "published": "true",
                },
                files={"file": (path.name, content, content_type)},
                timeout=120,
            )
            response.raise_for_status()
            existing_hashes.add(file_hash)
            imported += 1
            print(f"AKTARILDI {index:03d}: {path.name}")

        print(f"Tamamlandı. Aktarılan: {imported}; tekrar olduğu için atlanan: {skipped}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
