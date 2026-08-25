-- Migration: Track when a confirmed staffing assignment has been converted
-- (graduated) into the real recurring_schedule / lessons tables.

ALTER TABLE staffing_assignments
  ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;
