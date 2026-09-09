import os
import re
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

import httpx
from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from starlette.responses import JSONResponse

from .auth import admin_user, create_token, current_user, hash_password, optional_user, verify_password
from .db import execute, init_database, query_all, query_one

ROOT = Path(__file__).resolve().parent.parent
UPLOAD_DIR = ROOT / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_database()
    yield


app = FastAPI(title="Mahmut Saltık Studio API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "*").split(","), allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.mount("/static", StaticFiles(directory=ROOT / "static"), name="static")


class RegisterInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=2, max_length=80)


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class ReviewInput(BaseModel):
    artwork_id: str
    purchase_code: str = Field(pattern=r"^MS-[A-Z0-9]{6}$")
    rating: int = Field(ge=1, le=5)
    body: str = Field(min_length=4, max_length=1000)


class ArtworkUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=120)
    description: Optional[str] = Field(default=None, max_length=1000)
    category: Optional[str] = None
    price_label: Optional[str] = None
    medium: Optional[str] = None
    dimensions: Optional[str] = None
    featured: Optional[bool] = None
    published: Optional[bool] = None
    sort_order: Optional[int] = Field(default=None, ge=0, le=100000)


class ProfileUpdate(BaseModel):
    display_name: str = Field(min_length=2, max_length=100)
    headline: str = Field(min_length=2, max_length=180)
    bio: str = Field(min_length=10, max_length=3000)
    location: str = Field(min_length=2, max_length=100)
    instagram_url: Optional[str] = None


class JournalUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=160)
    body: Optional[str] = Field(default=None, min_length=4, max_length=4000)
    featured: Optional[bool] = None
    published: Optional[bool] = None


class ArchiveUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=160)
    caption: Optional[str] = Field(default=None, max_length=4000)
    kind: Optional[str] = None
    sort_order: Optional[int] = Field(default=None, ge=0, le=100000)
    published: Optional[bool] = None


@app.exception_handler(StarletteHTTPException)
async def http_error(request: Request, exc: StarletteHTTPException):
    if request.url.path.startswith("/api/"):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail or "İstek bulunamadı."})
    page = ROOT / "static" / ("404.html" if exc.status_code == 404 else "500.html")
    return FileResponse(page, status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError):
    detail = "Gönderilen bilgileri kontrol edin."
    if request.url.path.startswith("/api/"):
        return JSONResponse(status_code=422, content={"detail": detail, "errors": exc.errors()})
    return FileResponse(ROOT / "static" / "500.html", status_code=422)


@app.exception_handler(Exception)
async def unhandled_error(request: Request, exc: Exception):
    print(f"[server-error] {exc}")
    if request.url.path.startswith("/api/"):
        return JSONResponse(status_code=500, content={"detail": "Sunucu işlemi tamamlayamadı. Lütfen birkaç saniye sonra tekrar deneyin."})
    return FileResponse(ROOT / "static" / "500.html", status_code=500)


@app.get("/api/health")
def health():
    row = query_one("SELECT 1 AS ok")
    supabase_url, service_key, bucket = storage_settings()
    storage_configured = bool(supabase_url and service_key)
    return {"ok": bool(row and row["ok"] == 1), "storage": "supabase" if storage_configured else "local-fallback", "storage_configured": storage_configured, "storage_bucket": bucket}


@app.get("/api/config")
def config():
    return {"whatsapp_number": os.getenv("WHATSAPP_NUMBER", ""), "instagram_username": os.getenv("INSTAGRAM_USERNAME", "")}


@app.get("/api/profile")
def profile():
    return query_one("SELECT display_name, headline, bio, location, portrait_url, instagram_url FROM site_profile WHERE id = 1")


@app.get("/api/journal")
def journal():
    return query_all("SELECT id, title, body, media_url, media_type, featured, published, created_at FROM journal_entries WHERE published = TRUE ORDER BY featured DESC, created_at DESC")


@app.get("/api/archive")
def public_archive():
    return query_all("SELECT id, source, source_id, kind, title, caption, media_url, media_type, sort_order, created_at FROM social_archive WHERE published = TRUE ORDER BY sort_order ASC, created_at ASC")


@app.get("/api/artworks")
def artworks(include_unpublished: bool = False, user: Optional[dict] = Depends(optional_user)):
    if include_unpublished and (not user or user["role"] != "admin"):
        raise HTTPException(status_code=403, detail="Yayınlanmamış eserleri yalnızca yönetici görebilir.")
    where = "" if include_unpublished else "WHERE published = TRUE"
    return query_all(f"SELECT id, title, slug, category, description, image_url, video_url, price_label, available, featured, published, medium, dimensions, code, sort_order, created_at FROM artworks {where} ORDER BY featured DESC, sort_order ASC, created_at DESC")


@app.post("/api/auth/register")
def register(data: RegisterInput):
    if query_one("SELECT id FROM users WHERE lower(email) = lower(%s)", (data.email,)):
        raise HTTPException(status_code=409, detail="Bu e-posta zaten kayıtlı.")
    user = query_one("INSERT INTO users (email, password_hash, name, role) VALUES (%s, %s, %s, 'user') RETURNING id, email, name, role", (data.email, hash_password(data.password), data.name))
    response = JSONResponse({"user": user})
    response.set_cookie("studio_session", create_token(user), httponly=True, samesite="lax", secure=os.getenv("COOKIE_SECURE", "false").lower() == "true", max_age=60 * 60 * 24 * 14)
    return response


@app.post("/api/auth/login")
def login(data: LoginInput):
    user = query_one("SELECT id, email, name, role, password_hash FROM users WHERE lower(email) = lower(%s)", (data.email,))
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı.")
    response = JSONResponse({"user": {key: user[key] for key in ("id", "email", "name", "role")}})
    response.set_cookie("studio_session", create_token(user), httponly=True, samesite="lax", secure=os.getenv("COOKIE_SECURE", "false").lower() == "true", max_age=60 * 60 * 24 * 14)
    return response


@app.post("/api/admin/login")
def admin_login(password: str = Form(...)):
    expected = os.getenv("ADMIN_PASSWORD", "")
    if not expected or not hmac_compare(password, expected):
        raise HTTPException(status_code=401, detail="Yönetici şifresi hatalı.")
    admin = {"id": "admin", "email": "admin@studio.local", "name": "Mahmut Saltık", "role": "admin"}
    response = JSONResponse({"user": admin})
    response.set_cookie("studio_session", create_token(admin), httponly=True, samesite="lax", secure=os.getenv("COOKIE_SECURE", "false").lower() == "true", max_age=60 * 60 * 24 * 14)
    return response


def hmac_compare(first: str, second: str) -> bool:
    import hmac
    return hmac.compare_digest(first, second)


@app.post("/api/auth/logout")
def logout():
    response = JSONResponse({"success": True})
    response.delete_cookie("studio_session")
    return response


@app.get("/api/auth/me")
def me(user: dict = Depends(current_user)):
    return {"user": user}


async def store_upload(file: UploadFile) -> tuple[str, Optional[str]]:
    extension = Path(file.filename or "").suffix.lower()
    allowed = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm", ".mov"}
    if extension not in allowed:
        raise HTTPException(status_code=400, detail="Dosya türü desteklenmiyor. JPG, PNG, WEBP, MP4 veya WEBM yükleyin.")
    max_bytes = 100 * 1024 * 1024
    filename = f"{uuid.uuid4().hex}{extension}"
    local_path = UPLOAD_DIR / filename
    size = 0
    with local_path.open("wb") as output:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > max_bytes:
                local_path.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail="Dosya çok büyük. Maksimum dosya boyutu 100 MB.")
            output.write(chunk)
    local_url = f"/static/uploads/{filename}"

    supabase_url, service_key, bucket = storage_settings()
    if bool(supabase_url) != bool(service_key):
        local_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Supabase Storage ayarları eksik. SUPABASE_URL ile service role veya secret key birlikte tanımlanmalı.")
    if supabase_url and service_key:
        content = local_path.read_bytes()
        headers = {"Authorization": f"Bearer {service_key}", "apikey": service_key, "Content-Type": file.content_type or "application/octet-stream", "x-upsert": "true"}
        async with httpx.AsyncClient(timeout=60) as client:
            upload = await client.post(f"{supabase_url.rstrip('/')}/storage/v1/object/{bucket}/{filename}", headers=headers, content=content)
            if upload.status_code == 404:
                await client.post(f"{supabase_url.rstrip('/')}/storage/v1/bucket", headers={"Authorization": f"Bearer {service_key}", "apikey": service_key, "Content-Type": "application/json"}, json={"id": bucket, "name": bucket, "public": True})
                upload = await client.post(f"{supabase_url.rstrip('/')}/storage/v1/object/{bucket}/{filename}", headers=headers, content=content)
            if not upload.is_success:
                local_path.unlink(missing_ok=True)
                raise HTTPException(status_code=502, detail="Supabase Storage dosyayı kabul etmedi. Bucket ve Service Role Key ayarlarını kontrol edin.")
        local_path.unlink(missing_ok=True)
        return f"{supabase_url.rstrip('/')}/storage/v1/object/public/{bucket}/{filename}", filename
    return local_url, filename


def storage_settings() -> tuple[str, str, str]:
    """Leest de Storage-configuratie en maakt per ongeluk geplakte API-paden onschadelijk."""
    supabase_url = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
    if supabase_url.endswith("/rest/v1"):
        supabase_url = supabase_url[: -len("/rest/v1")].rstrip("/")
    service_key = (os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SECRET_KEY") or "").strip()
    bucket = os.getenv("SUPABASE_STORAGE_BUCKET", "artworks").strip() or "artworks"
    return supabase_url, service_key, bucket


@app.patch("/api/admin/profile")
def update_profile(data: ProfileUpdate, user: dict = Depends(admin_user)):
    return query_one("UPDATE site_profile SET display_name = %s, headline = %s, bio = %s, location = %s, instagram_url = %s, updated_at = now() WHERE id = 1 RETURNING *", (data.display_name, data.headline, data.bio, data.location, data.instagram_url))


@app.get("/api/admin/journal")
def admin_journal(user: dict = Depends(admin_user)):
    return query_all("SELECT id, title, body, media_url, media_type, featured, published, created_at FROM journal_entries ORDER BY featured DESC, created_at DESC")


@app.post("/api/admin/journal")
async def create_journal(title: str = Form(...), body: str = Form(...), featured: bool = Form(False), file: Optional[UploadFile] = File(None), user: dict = Depends(admin_user)):
    media_url, _ = (None, None)
    media_type = "text"
    if file and file.filename:
        media_url, _ = await store_upload(file)
        media_type = "video" if (file.content_type or "").startswith("video/") else "image"
    return query_one("INSERT INTO journal_entries (title, body, media_url, media_type, featured) VALUES (%s, %s, %s, %s, %s) RETURNING *", (title, body, media_url, media_type, featured))


@app.patch("/api/admin/journal/{entry_id}")
def update_journal(entry_id: str, data: JournalUpdate, user: dict = Depends(admin_user)):
    values = {key: value for key, value in data.model_dump().items() if value is not None}
    if not values:
        raise HTTPException(status_code=400, detail="Değiştirilecek alan bulunamadı.")
    assignments = ", ".join(f"{key} = %s" for key in values)
    row = query_one(f"UPDATE journal_entries SET {assignments} WHERE id = %s RETURNING *", tuple(values.values()) + (entry_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Günlük kaydı bulunamadı.")
    return row


@app.delete("/api/admin/journal/{entry_id}")
def delete_journal(entry_id: str, user: dict = Depends(admin_user)):
    row = query_one("DELETE FROM journal_entries WHERE id = %s RETURNING id", (entry_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Günlük kaydı bulunamadı.")
    return {"success": True}


@app.get("/api/admin/archive")
def admin_archive(user: dict = Depends(admin_user)):
    return query_all("SELECT * FROM social_archive ORDER BY sort_order ASC, created_at ASC")


@app.post("/api/admin/archive")
async def create_archive(kind: str = Form(...), title: str = Form(""), caption: str = Form(""), sort_order: int = Form(0), published: bool = Form(False), file: UploadFile = File(...), user: dict = Depends(admin_user)):
    if kind not in {"post", "video", "highlight"}:
        raise HTTPException(status_code=400, detail="Arşiv türü post, video veya highlight olmalı.")
    media_url, _ = await store_upload(file)
    media_type = "video" if (file.content_type or "").startswith("video/") else "image"
    return query_one("INSERT INTO social_archive (source, kind, title, caption, media_url, media_type, sort_order, published) VALUES ('manual', %s, %s, %s, %s, %s, %s, %s) RETURNING *", (kind, title, caption, media_url, media_type, sort_order, published))


@app.patch("/api/admin/archive/{entry_id}")
def update_archive(entry_id: str, data: ArchiveUpdate, user: dict = Depends(admin_user)):
    values = {key: value for key, value in data.model_dump().items() if value is not None}
    values = {key: value for key, value in values.items() if key in {"title", "caption", "kind", "sort_order", "published"}}
    if not values:
        raise HTTPException(status_code=400, detail="Değiştirilecek alan bulunamadı.")
    assignments = ", ".join(f"{key} = %s" for key in values)
    row = query_one(f"UPDATE social_archive SET {assignments} WHERE id = %s RETURNING *", tuple(values.values()) + (entry_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Arşiv kaydı bulunamadı.")
    return row


@app.delete("/api/admin/archive/{entry_id}")
def delete_archive(entry_id: str, user: dict = Depends(admin_user)):
    row = query_one("DELETE FROM social_archive WHERE id = %s RETURNING id", (entry_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Arşiv kaydı bulunamadı.")
    return {"success": True}


@app.post("/api/commission/reference")
async def upload_commission_reference(file: UploadFile = File(...), user: dict = Depends(current_user)):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="Referans dosyası bir görsel olmalı.")
    supabase_url, service_key, _ = storage_settings()
    if not (supabase_url and service_key):
        raise HTTPException(status_code=503, detail="Referans yüklemek için Supabase Storage ayarları henüz tamamlanmamış.")
    url, _ = await store_upload(file)
    return {"url": url}


@app.post("/api/admin/artworks")
async def create_artwork(title: str = Form(...), description: str = Form(...), category: str = Form(...), price_label: str = Form(...), medium: str = Form(...), dimensions: str = Form(...), sort_order: int = Form(0), featured: bool = Form(False), published: bool = Form(False), file: UploadFile = File(...), user: dict = Depends(admin_user)):
    image_url, storage_key = await store_upload(file)
    code = f"MS-{uuid.uuid4().hex[:6].upper()}"
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-") + "-" + code.lower()
    is_video = (file.content_type or "").startswith("video/")
    row = query_one("INSERT INTO artworks (title, slug, category, description, image_url, video_url, price_label, featured, published, sort_order, medium, dimensions, code, storage_key) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *", (title, slug, category, description, image_url, image_url if is_video else None, price_label, featured, published, sort_order, medium, dimensions, code, storage_key))
    return row


@app.patch("/api/admin/artworks/{artwork_id}")
def update_artwork(artwork_id: str, data: ArtworkUpdate, user: dict = Depends(admin_user)):
    values = {key: value for key, value in data.model_dump().items() if value is not None}
    if not values:
        raise HTTPException(status_code=400, detail="Değiştirilecek alan bulunamadı.")
    allowed = {"title", "description", "category", "price_label", "medium", "dimensions", "featured", "published", "sort_order"}
    values = {key: value for key, value in values.items() if key in allowed}
    if not values:
        raise HTTPException(status_code=400, detail="Değiştirilecek alan bulunamadı.")
    assignments = ", ".join(f"{key} = %s" for key in values)
    params = tuple(values.values()) + (artwork_id,)
    row = query_one(f"UPDATE artworks SET {assignments} WHERE id = %s RETURNING *", params)
    if not row:
        raise HTTPException(status_code=404, detail="Eser bulunamadı.")
    return row


@app.delete("/api/admin/artworks/{artwork_id}")
async def delete_artwork(artwork_id: str, user: dict = Depends(admin_user)):
    row = query_one("DELETE FROM artworks WHERE id = %s RETURNING id, storage_key", (artwork_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Eser bulunamadı.")
    supabase_url, service_key, bucket = storage_settings()
    if row.get("storage_key") and supabase_url and service_key:
        headers = {"Authorization": f"Bearer {service_key}", "apikey": service_key}
        async with httpx.AsyncClient(timeout=30) as client:
            await client.delete(f"{supabase_url.rstrip('/')}/storage/v1/object/{bucket}/{row['storage_key']}", headers=headers)
    return {"success": True}


@app.post("/api/reviews")
def create_review(data: ReviewInput, user: dict = Depends(current_user)):
    artwork = query_one("SELECT id, code FROM artworks WHERE id = %s", (data.artwork_id,))
    if not artwork or artwork["code"] != data.purchase_code:
        raise HTTPException(status_code=400, detail="Satın alma kodu bu eserle eşleşmiyor.")
    duplicate = query_one("SELECT id FROM reviews WHERE artwork_id = %s AND user_id = %s", (data.artwork_id, user["id"]))
    if duplicate:
        raise HTTPException(status_code=409, detail="Bu eser için daha önce yorum yaptınız.")
    return query_one("INSERT INTO reviews (artwork_id, user_id, rating, body, approved) VALUES (%s, %s, %s, %s, FALSE) RETURNING id, rating, body, approved, created_at", (data.artwork_id, user["id"], data.rating, data.body))


@app.get("/api/reviews/{artwork_id}")
def public_reviews(artwork_id: str):
    return query_all("SELECT r.id, r.rating, r.body, r.created_at, u.name AS user_name FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.artwork_id = %s AND r.approved = TRUE ORDER BY r.created_at DESC", (artwork_id,))


@app.post("/api/favorites/{artwork_id}")
def toggle_favorite(artwork_id: str, user: dict = Depends(current_user)):
    exists = query_one("SELECT 1 FROM favorites WHERE user_id = %s AND artwork_id = %s", (user["id"], artwork_id))
    if exists:
        execute("DELETE FROM favorites WHERE user_id = %s AND artwork_id = %s", (user["id"], artwork_id))
        return {"favorited": False}
    execute("INSERT INTO favorites (user_id, artwork_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (user["id"], artwork_id))
    return {"favorited": True}


@app.get("/api/admin/reviews")
def admin_reviews(user: dict = Depends(admin_user)):
    return query_all("SELECT r.id, r.rating, r.body, r.approved, r.created_at, a.title AS artwork_title, a.code, u.name AS user_name, u.email FROM reviews r JOIN artworks a ON a.id = r.artwork_id JOIN users u ON u.id = r.user_id ORDER BY r.created_at DESC")


@app.patch("/api/admin/reviews/{review_id}")
def moderate_review(review_id: str, approved: bool = Form(...), user: dict = Depends(admin_user)):
    row = query_one("UPDATE reviews SET approved = %s WHERE id = %s RETURNING id, approved", (approved, review_id))
    if not row:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı.")
    return row


@app.delete("/api/admin/reviews/{review_id}")
def delete_review(review_id: str, user: dict = Depends(admin_user)):
    row = query_one("DELETE FROM reviews WHERE id = %s RETURNING id", (review_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı.")
    return {"success": True}


@app.get("/")
def home():
    return FileResponse(ROOT / "static" / "index.html")


@app.get("/admin")
def admin_page():
    return FileResponse(ROOT / "static" / "admin.html")


@app.get("/robots.txt")
def robots():
    return FileResponse(ROOT / "static" / "robots.txt", media_type="text/plain")


@app.get("/sitemap.xml")
def sitemap():
    return FileResponse(ROOT / "static" / "sitemap.xml", media_type="application/xml")
