-- Migration: Carry the full staffing_needs context onto recurring_schedule at conversion
-- time, even though the fixed/weekly schedule screens don't display it yet. That way the
-- data isn't lost when moving from the staffing screen to the fixed schedule, and it's
-- already there whenever a UI field is added to show it.

ALTER TABLE recurring_schedule
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS manager_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS framework TEXT,
  ADD COLUMN IF NOT EXISTS framework_name TEXT,
  ADD COLUMN IF NOT EXISTS field TEXT,
  ADD COLUMN IF NOT EXISTS lesson_duration INT,
  ADD COLUMN IF NOT EXISTS lessons_count INT,
  ADD COLUMN IF NOT EXISTS notes TEXT;
