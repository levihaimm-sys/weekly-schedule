-- WhatsApp reminder system: opt-in flag + message log

-- 1. Add opt-in flag to instructors (default false — must be explicitly enabled)
ALTER TABLE instructors
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT false;

-- 2. Message log table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_params JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL CHECK (status IN ('dry_run', 'sent', 'failed')),
  provider_message_id TEXT,
  error TEXT,
  target_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_whatsapp_messages_target_date ON whatsapp_messages (target_date);
CREATE INDEX idx_whatsapp_messages_instructor ON whatsapp_messages (instructor_id, target_date);

-- Unique constraint to prevent duplicate reminders per instructor per day
CREATE UNIQUE INDEX idx_whatsapp_messages_unique_reminder
  ON whatsapp_messages (instructor_id, target_date)
  WHERE status IN ('dry_run', 'sent');

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage whatsapp messages"
  ON whatsapp_messages FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
