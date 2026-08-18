-- Migration: Add a manually-set "last contact date" to clients.
-- Purpose: The user wants an explicit last-contact-date field they control by hand,
-- separate from the automatic timestamp on client_activities notes (writing a note
-- should NOT silently change this date).

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS last_contact_date DATE;
