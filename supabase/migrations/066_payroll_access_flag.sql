-- Per-feature access to שכר מדריכים for non-owner admins. The owner always has
-- access; can_view_payroll grants only the payroll page (not client payments,
-- P&L or sandbox, which stay owner-only).

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS can_view_payroll BOOLEAN NOT NULL DEFAULT false;

-- שירן's admin account (not שירן זנה the instructor).
UPDATE profiles SET can_view_payroll = true WHERE id = '508834c7-a00b-4ce1-bf56-d00a59cd5529';

DROP POLICY IF EXISTS "Owner can manage pay rates" ON instructor_pay_rates;
CREATE POLICY "Owner can manage pay rates" ON instructor_pay_rates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_owner = true OR can_view_payroll = true))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_owner = true OR can_view_payroll = true))
  );

DROP POLICY IF EXISTS "Owner can manage pay exceptions" ON instructor_pay_exceptions;
CREATE POLICY "Owner can manage pay exceptions" ON instructor_pay_exceptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_owner = true OR can_view_payroll = true))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_owner = true OR can_view_payroll = true))
  );

DROP POLICY IF EXISTS "Owner can manage pay bonuses" ON instructor_pay_bonuses;
CREATE POLICY "Owner can manage pay bonuses" ON instructor_pay_bonuses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_owner = true OR can_view_payroll = true))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_owner = true OR can_view_payroll = true))
  );
