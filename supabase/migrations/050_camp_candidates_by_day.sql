-- Migration: Simplify camp instructor assignment from per-group to per-camp-day
-- Purpose: Camps are staffed by workday, not per individual group/lesson — an instructor
-- who's confirmed for a camp day isn't tied to a specific one of its groups. Replaces the
-- per-group candidate tables from migration 049 with one candidates table directly on
-- camp_requests, carrying over any candidates already entered.

CREATE TABLE IF NOT EXISTS camp_request_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_request_id UUID NOT NULL REFERENCES camp_requests(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  is_confirmed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (camp_request_id, instructor_id)
);

CREATE INDEX IF NOT EXISTS idx_camp_request_candidates_request ON camp_request_candidates(camp_request_id);
CREATE INDEX IF NOT EXISTS idx_camp_request_candidates_instructor ON camp_request_candidates(instructor_id);

ALTER TABLE camp_request_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage camp request candidates"
  ON camp_request_candidates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Carry over anything already entered under the old per-group model: one candidate per
-- (camp request, instructor), confirmed if they were confirmed on any of that request's groups.
INSERT INTO camp_request_candidates (camp_request_id, instructor_id, is_confirmed, created_at)
SELECT cg.camp_request_id, cgc.instructor_id, bool_or(cgc.is_confirmed), min(cgc.created_at)
FROM camp_group_candidates cgc
JOIN camp_groups cg ON cg.id = cgc.group_id
GROUP BY cg.camp_request_id, cgc.instructor_id
ON CONFLICT (camp_request_id, instructor_id) DO NOTHING;

DROP TABLE IF EXISTS camp_group_candidates;
DROP TABLE IF EXISTS camp_groups;
