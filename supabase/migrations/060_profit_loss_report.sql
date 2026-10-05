-- Owner-only monthly profit & loss report (דוח רווח והפסד). Builds on the
-- payroll (056/057) and client payments (058/059) modules and adds only what
-- the owner's monthly Excel had that the system didn't:
--   * per-instructor employment settings (עצמאי/שכיר, employer cost %, office)
--     — persistent, carried over month to month like pay rates
--   * manual monthly override of the signature-based activity count / work days
--   * fixed expenses (recurring every month, or for a single month)

CREATE TABLE IF NOT EXISTS instructor_employment_settings (
  instructor_id UUID PRIMARY KEY REFERENCES instructors(id) ON DELETE CASCADE,
  employment_type TEXT NOT NULL DEFAULT 'freelance'
    CHECK (employment_type IN ('freelance', 'employee')),
  employer_cost_pct NUMERIC(5,2) NOT NULL DEFAULT 25,
  is_office BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pl_activity_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  city TEXT NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  activity_count INT,
  work_days INT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS pl_activity_overrides_key
  ON pl_activity_overrides (instructor_id, client_name, city, year, month);

-- year/month NULL = recurring every month
CREATE TABLE IF NOT EXISTS pl_fixed_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  year INT,
  month INT CHECK (month BETWEEN 1 AND 12),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE instructor_employment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pl_activity_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE pl_fixed_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage employment settings" ON instructor_employment_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );

CREATE POLICY "Owner can manage activity overrides" ON pl_activity_overrides
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );

CREATE POLICY "Owner can manage fixed expenses" ON pl_fixed_expenses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );
