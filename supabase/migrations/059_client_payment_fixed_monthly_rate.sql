-- Some clients (e.g. עיריית הוד השרון) pay a flat amount per month for a
-- given city/region, regardless of how many lessons were actually taught
-- there — as long as at least one lesson happened. Add a billing mode to
-- client_payment_rates so the owner can switch a client+city group between
-- "per lesson" (existing behavior) and "fixed monthly".

ALTER TABLE client_payment_rates
  ADD COLUMN IF NOT EXISTS billing_mode TEXT NOT NULL DEFAULT 'per_lesson'
    CHECK (billing_mode IN ('per_lesson', 'fixed_monthly'));

ALTER TABLE client_payment_rates
  ADD COLUMN IF NOT EXISTS fixed_monthly_amount NUMERIC(10,2) NOT NULL DEFAULT 0;
