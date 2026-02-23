-- Add is_one_time_change flag to lessons table
-- When true, this lesson was explicitly modified for this specific date (temporary/one-time change)
-- The sync mechanism will skip these lessons and not reset them to recurring schedule values
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_one_time_change BOOLEAN DEFAULT false;
