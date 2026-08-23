-- Migration: Next-year staffing planning module (lightweight, self-contained)
-- Purpose: Let admin plan instructor <-> client-lesson matches ahead of the new year,
-- without requiring every name to already exist as a real instructor/client record.
-- Instructor and client identity here is a plain free-text name.
-- day_of_week may be NULL to represent a "flexible, not yet pinned to a day" slot;
-- confirming an assignment against a flexible slot fills in assigned_day_of_week.

CREATE TABLE IF NOT EXISTS staffing_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_name TEXT NOT NULL,
  region TEXT NOT NULL,
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  time_period TEXT NOT NULL CHECK (time_period IN ('morning', 'noon', 'afternoon', 'evening')),
  start_time TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staffing_needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  region TEXT,
  location_name TEXT,
  address TEXT,
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  time_period TEXT CHECK (time_period IN ('morning', 'noon', 'afternoon', 'evening')),
  start_time TEXT,
  field TEXT,
  lessons_count INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partially_filled', 'filled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staffing_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES staffing_needs(id) ON DELETE CASCADE,
  instructor_name TEXT NOT NULL,
  availability_id UUID REFERENCES staffing_availability(id) ON DELETE SET NULL,
  assigned_day_of_week INT CHECK (assigned_day_of_week BETWEEN 0 AND 6),
  is_confirmed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staffing_needs_status ON staffing_needs(status);
CREATE INDEX IF NOT EXISTS idx_staffing_assignments_need ON staffing_assignments(need_id);
CREATE INDEX IF NOT EXISTS idx_staffing_assignments_availability ON staffing_assignments(availability_id);

ALTER TABLE staffing_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE staffing_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE staffing_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage staffing availability"
  ON staffing_availability FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage staffing needs"
  ON staffing_needs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage staffing assignments"
  ON staffing_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
