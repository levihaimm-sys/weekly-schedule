-- Migration: Camp staffing module — mirrors the regular staffing module but date-based
-- instead of day-of-week-based. Each table is scoped to a camp_session.

-- What clients need for the camp (one row per client-day)
CREATE TABLE IF NOT EXISTS camp_staffing_needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_session_id UUID NOT NULL REFERENCES camp_sessions(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  area TEXT,
  camp_date DATE NOT NULL,
  num_groups INT NOT NULL DEFAULT 1 CHECK (num_groups >= 1),
  start_time TEXT,
  field TEXT,
  framework TEXT,
  address TEXT,
  contact_name TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partially_filled', 'filled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Which instructors are available for which camp dates
CREATE TABLE IF NOT EXISTS camp_staffing_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_session_id UUID NOT NULL REFERENCES camp_sessions(id) ON DELETE CASCADE,
  instructor_name TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT '',
  camp_date DATE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  status_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Matching instructors to needs
CREATE TABLE IF NOT EXISTS camp_staffing_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES camp_staffing_needs(id) ON DELETE CASCADE,
  instructor_name TEXT NOT NULL,
  availability_id UUID REFERENCES camp_staffing_availability(id) ON DELETE SET NULL,
  is_confirmed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_camp_staffing_needs_session ON camp_staffing_needs(camp_session_id);
CREATE INDEX IF NOT EXISTS idx_camp_staffing_availability_session ON camp_staffing_availability(camp_session_id);
CREATE INDEX IF NOT EXISTS idx_camp_staffing_assignments_need ON camp_staffing_assignments(need_id);

ALTER TABLE camp_staffing_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_staffing_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_staffing_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage camp staffing needs"
  ON camp_staffing_needs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage camp staffing availability"
  ON camp_staffing_availability FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage camp staffing assignments"
  ON camp_staffing_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
