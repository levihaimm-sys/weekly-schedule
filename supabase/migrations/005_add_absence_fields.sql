-- Add absence request fields to lessons table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS instructor_absence_request BOOLEAN DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS instructor_notes TEXT;

-- Index for quick lookup of flagged lessons
CREATE INDEX IF NOT EXISTS idx_lessons_absence_request ON lessons (instructor_absence_request) WHERE instructor_absence_request = true;
