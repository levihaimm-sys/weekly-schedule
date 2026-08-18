-- Migration: Simplify client status to the 3-way classification the client actually
-- wants (existing client / potential client / not relevant), and add legal_name +
-- org_type so the full supplier-research spreadsheet can be represented.

ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;

UPDATE clients SET status = CASE status
  WHEN 'active' THEN 'existing_client'
  WHEN 'lead_new' THEN 'potential_client'
  WHEN 'not_relevant' THEN 'not_relevant'
  ELSE 'potential_client'
END;

ALTER TABLE clients
  ALTER COLUMN status SET DEFAULT 'potential_client',
  ADD COLUMN IF NOT EXISTS org_type TEXT,
  ADD COLUMN IF NOT EXISTS legal_name TEXT;

ALTER TABLE clients
  ADD CONSTRAINT clients_status_check
  CHECK (status IN ('existing_client', 'potential_client', 'not_relevant'));
