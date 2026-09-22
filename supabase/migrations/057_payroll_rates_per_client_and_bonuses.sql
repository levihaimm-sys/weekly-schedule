-- Pay rates need to vary per client/city, not just per instructor — e.g. אורית
-- teaches in באר יעקב for two different clients and is paid a different rate
-- (and travel addition) for each. Rework instructor_pay_rates from one row per
-- instructor to one row per (instructor, client, city).
--
-- Also add instructor_pay_bonuses: ad-hoc, month-specific extras (a bonus, a
-- parking reimbursement) that aren't tied to any lesson or client.

ALTER TABLE instructor_pay_rates DROP CONSTRAINT IF EXISTS instructor_pay_rates_instructor_id_key;
ALTER TABLE instructor_pay_rates ADD COLUMN IF NOT EXISTS client_name TEXT NOT NULL DEFAULT '';
ALTER TABLE instructor_pay_rates ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT '';
ALTER TABLE instructor_pay_rates ALTER COLUMN client_name DROP DEFAULT;
ALTER TABLE instructor_pay_rates ALTER COLUMN city DROP DEFAULT;

CREATE UNIQUE INDEX IF NOT EXISTS instructor_pay_rates_instructor_client_city_key
  ON instructor_pay_rates (instructor_id, client_name, city);

CREATE TABLE IF NOT EXISTS instructor_pay_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  label TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE instructor_pay_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage pay bonuses" ON instructor_pay_bonuses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );
