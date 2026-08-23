-- Migration: Next-year staffing planning module
-- Purpose: Let admin plan instructor <-> client-lesson matches ahead of the new year.
-- Availability slots belong to either an instructor or a recruitment candidate (not both).
-- day_of_week may be NULL to represent a "flexible, not yet pinned to a day" slot;
-- confirming an assignment against a flexible slot fills in assigned_day_of_week.

CREATE TABLE IF NOT EXISTS staffing_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES instructors(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES recruitment_candidates(id) ON DELETE CASCADE,
  region TEXT NOT NULL,
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  time_period TEXT NOT NULL CHECK (time_period IN ('morning', 'noon', 'afternoon', 'evening')),
  start_time TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT staffing_availability_person_check CHECK (
    (instructor_id IS NOT NULL AND candidate_id IS NULL) OR
    (instructor_id IS NULL AND candidate_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS staffing_needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  client_name_override TEXT,
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
  instructor_id UUID REFERENCES instructors(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES recruitment_candidates(id) ON DELETE CASCADE,
  availability_id UUID REFERENCES staffing_availability(id) ON DELETE SET NULL,
  assigned_day_of_week INT CHECK (assigned_day_of_week BETWEEN 0 AND 6),
  is_confirmed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT staffing_assignments_person_check CHECK (
    (instructor_id IS NOT NULL AND candidate_id IS NULL) OR
    (instructor_id IS NULL AND candidate_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_staffing_availability_instructor ON staffing_availability(instructor_id);
CREATE INDEX IF NOT EXISTS idx_staffing_availability_candidate ON staffing_availability(candidate_id);
CREATE INDEX IF NOT EXISTS idx_staffing_needs_client ON staffing_needs(client_id);
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
