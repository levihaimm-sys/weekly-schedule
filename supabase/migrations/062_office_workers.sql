-- Office workers are a separate list, not instructors: some (e.g. שירן עובדיה)
-- don't exist in the instructors table at all, and an instructor who also does
-- office work (רוית דביר) is listed here separately for that work.
-- Replaces the instructor-linked office hours from 061.

CREATE TABLE IF NOT EXISTS pl_office_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'freelance'
    CHECK (employment_type IN ('freelance', 'employee')),
  employer_cost_pct NUMERIC(5,2) NOT NULL DEFAULT 25,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pl_office_worker_hours (
  worker_id UUID NOT NULL REFERENCES pl_office_workers(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  hours NUMERIC(6,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (worker_id, year, month)
);

ALTER TABLE pl_office_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pl_office_worker_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage office workers" ON pl_office_workers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );

CREATE POLICY "Owner can manage office worker hours" ON pl_office_worker_hours
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );

-- Seed the two office workers (rate 60 for שירן per the owner's Excel; רוית's rate to be confirmed).
INSERT INTO pl_office_workers (full_name, hourly_rate)
SELECT v.full_name, v.hourly_rate
FROM (VALUES ('שירן עובדיה', 60), ('רוית דביר', 60)) AS v(full_name, hourly_rate)
WHERE NOT EXISTS (SELECT 1 FROM pl_office_workers w WHERE w.full_name = v.full_name);

-- Undo the instructor-linked office setup added by mistake (שירן זנה / רוית דביר as instructors).
DELETE FROM instructor_employment_settings
WHERE instructor_id IN ('dae387ae-362e-4b08-aa40-64988e1cfda9', '11710429-adcd-484d-9868-66a37614d914');
