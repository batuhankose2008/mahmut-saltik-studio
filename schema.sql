CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Karakalem', 'Yağlı Boya', 'Renkli', 'Dijital', 'Video')),
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  video_url TEXT,
  price_label TEXT NOT NULL,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  medium TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL CHECK (code ~ '^MS-[A-Z0-9]{6}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (artwork_id, user_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, artwork_id)
);

CREATE INDEX IF NOT EXISTS artworks_published_idx ON artworks (published, featured, created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_moderation_idx ON reviews (approved, created_at DESC);


ALTER TABLE artworks ADD COLUMN IF NOT EXISTS storage_key TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS site_profile (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  display_name TEXT NOT NULL DEFAULT 'Mahmut Saltık',
  headline TEXT NOT NULL DEFAULT 'Çizgi, bir izdir.',
  bio TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT 'İstanbul / TR',
  portrait_url TEXT,
  instagram_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO site_profile (id, display_name, headline, bio, location)
VALUES (1, 'Mahmut Saltık', 'Çizgi, bir izdir.', 'İnsanın yüzünde saklanan sessiz hikâyeleri arayan bir çizim atölyesi.', 'İstanbul / TR')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'video')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS artworks_sort_order_idx ON artworks (published, featured, sort_order, created_at DESC);
CREATE INDEX IF NOT EXISTS journal_published_idx ON journal_entries (published, featured, created_at DESC);


CREATE TABLE IF NOT EXISTS social_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'instagram' CHECK (source IN ('instagram', 'manual')),
  source_id TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('post', 'video', 'highlight')),
  title TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS social_archive_source_idx ON social_archive (source, source_id) WHERE source_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS social_archive_public_idx ON social_archive (published, sort_order, created_at DESC);
