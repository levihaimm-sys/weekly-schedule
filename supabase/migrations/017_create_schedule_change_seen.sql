-- Track which schedule changes an admin has marked as "seen"
CREATE TABLE IF NOT EXISTS schedule_change_seen (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  seen_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(lesson_id)
);

-- RLS
ALTER TABLE schedule_change_seen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage schedule_change_seen"
  ON schedule_change_seen
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_schedule_change_seen_lesson_id ON schedule_change_seen(lesson_id);
