-- Owner-only payroll module: per-instructor pay rate (per lesson), per-lesson
-- exceptions that override the rate for a specific lesson, and a travel
-- addition paid per work day. Visible/editable only by the owner (is_owner),
-- everyone else (including other admins) has no access — same pattern as the
-- is_owner tier added in 043.

CREATE TABLE IF NOT EXISTS instructor_pay_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL UNIQUE REFERENCES instructors(id) ON DELETE CASCADE,
  rate_per_lesson NUMERIC(10,2) NOT NULL DEFAULT 0,
  travel_rate_per_day NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS instructor_pay_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE instructor_pay_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_pay_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage pay rates" ON instructor_pay_rates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );

CREATE POLICY "Owner can manage pay exceptions" ON instructor_pay_exceptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );
