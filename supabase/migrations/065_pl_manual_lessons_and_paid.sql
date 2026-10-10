-- P&L report:
-- 1. pl_manual_lessons: lessons added by hand (not from the schedule/signatures).
--    With instructor_id → counted for the instructor's pay (and so billed to the client too).
--    Without instructor_id → billed to the client only.
-- 2. pl_payee_paid: "already paid" marker per instructor / office worker per month.
--    payee_id is an instructor id or "office__<worker id>", so it's TEXT without an FK.

CREATE TABLE IF NOT EXISTS pl_manual_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES instructors(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  lesson_count INT NOT NULL CHECK (lesson_count > 0),
  work_days INT NOT NULL DEFAULT 0 CHECK (work_days >= 0),
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pl_manual_lessons_year_month_idx ON pl_manual_lessons (year, month);

ALTER TABLE pl_manual_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage manual lessons" ON pl_manual_lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );

CREATE TABLE IF NOT EXISTS pl_payee_paid (
  payee_id TEXT NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (payee_id, year, month)
);

ALTER TABLE pl_payee_paid ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage paid status" ON pl_payee_paid
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );
