-- P&L report additions:
--   * office hours: office workers (e.g. שירן, רוית) don't log lessons, so the
--     owner enters their monthly hours manually. Hourly rate is persistent
--     (carried over month to month) on instructor_employment_settings.
--   * invoice status: owner ticks each client once that month's invoice was sent.

ALTER TABLE instructor_employment_settings
  ADD COLUMN IF NOT EXISTS office_hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS pl_office_hours (
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  hours NUMERIC(6,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (instructor_id, year, month)
);

CREATE TABLE IF NOT EXISTS pl_invoice_status (
  client_name TEXT NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (client_name, year, month)
);

ALTER TABLE pl_office_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE pl_invoice_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage office hours" ON pl_office_hours
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );

CREATE POLICY "Owner can manage invoice status" ON pl_invoice_status
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );
