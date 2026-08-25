-- Migration: Add lesson_duration (משך שיעור, minutes) to staffing_needs
-- Defaults to 40 for new rows; existing rows are backfilled to 40 as well.

ALTER TABLE staffing_needs
  ADD COLUMN IF NOT EXISTS lesson_duration INTEGER DEFAULT 40;

UPDATE staffing_needs
  SET lesson_duration = 40
  WHERE lesson_duration IS NULL;
