-- Public client portal: each client gets a permanent, token-based link (no login)
-- showing their upcoming lessons. Requires linking recurring_schedule rows to a
-- client record so lessons can be resolved for a given client.

ALTER TABLE clients ADD COLUMN IF NOT EXISTS portal_token UUID NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS clients_portal_token_key ON clients(portal_token);

ALTER TABLE recurring_schedule ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS recurring_schedule_client_id_idx ON recurring_schedule(client_id);

-- Best-effort backfill: link existing schedule rows to a client record by exact name match.
-- Anything left unlinked can be linked manually from the client's "portal link" panel.
UPDATE recurring_schedule rs
SET client_id = c.id
FROM clients c
WHERE rs.client_id IS NULL
  AND rs.client_name IS NOT NULL
  AND trim(rs.client_name) = trim(c.name);
