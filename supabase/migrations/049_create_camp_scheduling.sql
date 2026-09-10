-- Migration: Summer camps intake module (קייטנות) — lightweight, self-contained
-- Purpose: Let admin log camp staffing requests as clients send them (e.g. "צפון תל אביב -
-- 24.9 - 5 קבוצות - החל מ9 בבוקר") and assign instructors to each group, purely for internal
-- order/tracking. Not connected to the real schedule — once exact lesson details (addresses,
-- times, etc.) arrive, those are entered separately into the regular schedule module.

CREATE TABLE IF NOT EXISTS camp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT,
  area TEXT NOT NULL,
  camp_date DATE NOT NULL,
  num_groups INT NOT NULL DEFAULT 1 CHECK (num_groups >= 1),
  start_time_note TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS camp_group_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_request_id UUID NOT NULL REFERENCES camp_requests(id) ON DELETE CASCADE,
  group_number INT NOT NULL,
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (camp_request_id, group_number)
);

CREATE INDEX IF NOT EXISTS idx_camp_requests_date ON camp_requests(camp_date);
CREATE INDEX IF NOT EXISTS idx_camp_group_assignments_request ON camp_group_assignments(camp_request_id);
CREATE INDEX IF NOT EXISTS idx_camp_group_assignments_instructor ON camp_group_assignments(instructor_id);

ALTER TABLE camp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_group_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage camp requests"
  ON camp_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage camp group assignments"
  ON camp_group_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
