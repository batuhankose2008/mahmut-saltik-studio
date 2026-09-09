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

CREATE INDEX IF NOT EXISTS journal_published_idx ON journal_entries (published, featured, created_at DESC);
