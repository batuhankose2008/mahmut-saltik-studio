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
