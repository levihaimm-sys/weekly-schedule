-- Migration: Summer camps intake module (קייטנות) — lightweight, self-contained
-- Purpose: Let admin log camp staffing requests as clients send them (e.g. "צפון תל אביב -
-- 24.9 - 5 קבוצות - החל מ9 בבוקר"), assign one or more candidate instructors to each group,
-- and confirm one per group — mirroring the staffing_needs/staffing_assignments pattern used
-- for next-year staffing. Not connected to the real schedule — once exact lesson details
-- (addresses, times, etc.) arrive, those are entered separately into the regular schedule module.

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

-- One row per group "slot" within a camp request (e.g. 5 groups -> 5 rows).
CREATE TABLE IF NOT EXISTS camp_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_request_id UUID NOT NULL REFERENCES camp_requests(id) ON DELETE CASCADE,
  group_number INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (camp_request_id, group_number)
);

-- Multiple candidate instructors can be attached to the same group; at most one is
-- normally confirmed at a time (enforced in app code, not a DB constraint, since a
-- moment mid-edit may briefly have none confirmed).
CREATE TABLE IF NOT EXISTS camp_group_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES camp_groups(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  is_confirmed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, instructor_id)
);

CREATE INDEX IF NOT EXISTS idx_camp_requests_date ON camp_requests(camp_date);
CREATE INDEX IF NOT EXISTS idx_camp_groups_request ON camp_groups(camp_request_id);
CREATE INDEX IF NOT EXISTS idx_camp_group_candidates_group ON camp_group_candidates(group_id);
CREATE INDEX IF NOT EXISTS idx_camp_group_candidates_instructor ON camp_group_candidates(instructor_id);

ALTER TABLE camp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_group_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage camp requests"
  ON camp_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage camp groups"
  ON camp_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage camp group candidates"
  ON camp_group_candidates FOR ALL TO authenticated USING (true) WITH CHECK (true);
