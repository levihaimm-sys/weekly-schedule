-- Migration: Track when an availability row's free-text status was last edited,
-- so the availability table can show a short "updated on" date next to it.

ALTER TABLE staffing_availability ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ;
