-- Migration: Focused list of potential instructors for next-year staffing planning.
-- Deliberately narrower than recruitment_candidates (no CV/email/status pipeline) —
-- just enough to track who to call: name, phone, work area, field, and when they were
-- last contacted. last_contact_at is stamped by the app whenever last_contact_note changes.

CREATE TABLE IF NOT EXISTS staffing_potential_instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT,
  region TEXT,
  field TEXT,
  last_contact_note TEXT,
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE staffing_potential_instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage potential instructors"
  ON staffing_potential_instructors FOR ALL TO authenticated USING (true) WITH CHECK (true);
