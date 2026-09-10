CREATE TABLE IF NOT EXISTS admin_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  password_hash TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO admin_settings (id, password_hash)
VALUES (1, NULL)
ON CONFLICT (id) DO NOTHING;
