-- Owner-only client payments module: mirrors the instructor payroll module
-- (056/057), but tracks what the organization is PAID BY each client for
-- their lessons, broken down by client + city (the same axis payroll uses).
-- Visible/editable only by the owner (is_owner) — same pattern as 043/056/057.

CREATE TABLE IF NOT EXISTS client_payment_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  city TEXT NOT NULL,
  rate_per_lesson NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS client_payment_rates_client_city_key
  ON client_payment_rates (client_name, city);

CREATE TABLE IF NOT EXISTS client_payment_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_payment_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  label TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE client_payment_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_payment_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_payment_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage client payment rates" ON client_payment_rates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );

CREATE POLICY "Owner can manage client payment exceptions" ON client_payment_exceptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );

CREATE POLICY "Owner can manage client payment adjustments" ON client_payment_adjustments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );
