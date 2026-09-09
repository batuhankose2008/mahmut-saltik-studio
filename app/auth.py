import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from fastapi import Cookie, HTTPException, status

from .db import query_one

JWT_SECRET = os.environ.get("JWT_SECRET", "")
ALGORITHM = "HS256"
SESSION_COOKIE = "studio_session"

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is required")


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1, dklen=64)
    return f"{salt.hex()}:{derived.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, key_hex = stored.split(":", 1)
        derived = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1, dklen=64)
        return hmac.compare_digest(derived.hex(), key_hex)
    except (ValueError, TypeError):
        return False


def create_token(user: dict) -> str:
    expires = datetime.now(timezone.utc) + timedelta(days=14)
    payload = {"sub": str(user["id"]), "email": user["email"], "name": user["name"], "role": user["role"], "exp": expires}
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Oturum geçersiz veya süresi dolmuş.") from exc


def current_user(session: Optional[str] = Cookie(default=None, alias=SESSION_COOKIE)) -> dict:
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bu işlem için giriş yapmalısınız.")
    payload = decode_token(session)
    if payload.get("role") == "admin":
        return {"id": payload["sub"], "email": payload.get("email", "admin@studio.local"), "name": payload.get("name", "Mahmut Saltık"), "role": "admin"}
    user = query_one("SELECT id, email, name, role FROM users WHERE id = %s", (payload["sub"],))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Kullanıcı bulunamadı.")
    return user


def admin_user(session: Optional[str] = Cookie(default=None, alias=SESSION_COOKIE)) -> dict:
    user = current_user(session)
    if user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Yönetici yetkisi gerekiyor.")
    return user


def optional_user(session: Optional[str] = Cookie(default=None, alias=SESSION_COOKIE)) -> Optional[dict]:
    if not session:
        return None
    try:
        return current_user(session)
    except HTTPException:
        return None
