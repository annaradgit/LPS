ALTER TABLE tickets
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS guest_name text,
  ADD COLUMN IF NOT EXISTS guest_phone text,
  ADD COLUMN IF NOT EXISTS guest_email text,
  ADD COLUMN IF NOT EXISTS guest_address text,
  ADD COLUMN IF NOT EXISTS guest_city text,
  ADD COLUMN IF NOT EXISTS guest_postcode text;

CREATE INDEX IF NOT EXISTS tickets_guest_phone_idx
  ON tickets(guest_phone);

CREATE INDEX IF NOT EXISTS tickets_created_at_idx
  ON tickets(created_at DESC);