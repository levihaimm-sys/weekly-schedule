-- P&L report: manual correction of the billed activity count per client × city
-- on the invoices tab. Independent of pl_activity_overrides (instructor pay).

CREATE TABLE IF NOT EXISTS pl_invoice_overrides (
  client_name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  activity_count INT NOT NULL CHECK (activity_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (client_name, city, year, month)
);

ALTER TABLE pl_invoice_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage invoice overrides" ON pl_invoice_overrides
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );
