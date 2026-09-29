-- Whether the instructor teaches with our equipment ("עם ציוד"), shown as a
-- prominent toggle in the instructors table.
ALTER TABLE instructors
  ADD COLUMN IF NOT EXISTS has_equipment BOOLEAN DEFAULT false;
