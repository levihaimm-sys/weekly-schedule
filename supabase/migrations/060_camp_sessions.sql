-- Migration: Camp sessions — group camp requests by time period (e.g. "חנוכה 2026")
-- so the admin can archive old camp data and start fresh for each new camp period.

CREATE TABLE IF NOT EXISTS camp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE camp_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage camp sessions"
  ON camp_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Link every camp request to a session
ALTER TABLE camp_requests ADD COLUMN IF NOT EXISTS camp_session_id UUID REFERENCES camp_sessions(id) ON DELETE SET NULL;

-- Create an archived session for all existing data
INSERT INTO camp_sessions (id, name, start_date, end_date, is_archived)
VALUES ('00000000-0000-0000-0000-000000000001', 'קייטנה קודמת (ארכיון)', '2026-01-01', '2026-11-30', true);

-- Assign all existing requests to the archived session
UPDATE camp_requests SET camp_session_id = '00000000-0000-0000-0000-000000000001' WHERE camp_session_id IS NULL;

-- Create the new active session for December 6-12
INSERT INTO camp_sessions (name, start_date, end_date, is_archived)
VALUES ('קייטנת חנוכה דצמבר 2026', '2026-12-06', '2026-12-12', false);
