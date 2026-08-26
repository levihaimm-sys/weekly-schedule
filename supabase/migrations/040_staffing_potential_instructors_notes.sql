-- Migration: Separate general free-text info from the short status field on potential instructors.
-- last_contact_note stays the short status (still stamps last_contact_at when edited); notes is
-- a longer general-info field with no timestamp semantics.

ALTER TABLE staffing_potential_instructors ADD COLUMN IF NOT EXISTS notes TEXT;
