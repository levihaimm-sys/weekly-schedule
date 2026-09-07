-- Migration: Carry client/address/manager/contact/framework/field context directly on
-- `lessons` too, not only on recurring_schedule (see 042_recurring_schedule_staffing_fields.sql).
-- One-time lessons created via bulkImportLessons() have no recurring_schedule row to hang this
-- context off of, so the weekly schedule screens (and instructor "today"/"my-schedule" views)
-- had nowhere to read it from and always showed "—" for address/framework/field on imported
-- one-time lessons even though the CSV carried that data.

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS manager_name TEXT,
  ADD COLUMN IF NOT EXISTS manager_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS framework TEXT,
  ADD COLUMN IF NOT EXISTS framework_name TEXT,
  ADD COLUMN IF NOT EXISTS field TEXT,
  ADD COLUMN IF NOT EXISTS lesson_duration INTEGER,
  ADD COLUMN IF NOT EXISTS lessons_count INTEGER;
