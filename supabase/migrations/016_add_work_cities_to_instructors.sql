-- Add work_cities free-text column to instructors
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS work_cities text;
