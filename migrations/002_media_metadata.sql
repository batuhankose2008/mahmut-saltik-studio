ALTER TABLE artworks ADD COLUMN IF NOT EXISTS storage_key TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS artworks_sort_order_idx ON artworks (published, featured, sort_order, created_at DESC);
