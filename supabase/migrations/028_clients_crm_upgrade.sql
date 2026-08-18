-- Migration: Upgrade clients into a lead/communication CRM (mirrors recruitment module)
-- Purpose: Track category, region, priority and communication status for both active
-- clients and prospects, plus a per-client activity log for call/contact history.

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT
    CHECK (priority IN ('high', 'medium', 'low')),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('lead_new', 'contacted', 'no_answer', 'in_negotiation', 'active', 'not_relevant')),
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS client_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_activities_client_id ON client_activities(client_id);

ALTER TABLE client_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage client activities"
  ON client_activities
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
