-- Multi-value classification (e.g. קבוע / משלים, an instructor can be both)
-- and a free-text note/availability field, edited directly from the instructors table.
ALTER TABLE instructors
  ADD COLUMN IF NOT EXISTS classifications TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS note TEXT;
