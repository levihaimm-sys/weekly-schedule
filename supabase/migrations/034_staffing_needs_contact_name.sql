-- Migration: Add contact_name (איש קשר) to staffing_needs
-- Distinct from manager_name (מנהל/ת, the site manager) — a separate general contact person.

ALTER TABLE staffing_needs
  ADD COLUMN IF NOT EXISTS contact_name TEXT;
