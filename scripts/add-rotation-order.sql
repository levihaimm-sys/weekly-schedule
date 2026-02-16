-- Add rotation_order column to instructors table
-- This determines the order in which lesson plans rotate between instructors
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS rotation_order integer;

-- Set initial rotation order based on the specified chain:
-- סתיו דהן → אריאל ברמן → טליה דודזון → קרן ינוב → אורית צ'קול → רמי שמש → עליזה אברבנל → חוי פוקס → טל שומרת
UPDATE instructors SET rotation_order = 1 WHERE full_name = 'סתיו דהן';
UPDATE instructors SET rotation_order = 2 WHERE full_name = 'אריאל ברמן';
UPDATE instructors SET rotation_order = 3 WHERE full_name = 'טליה דודזון';
UPDATE instructors SET rotation_order = 4 WHERE full_name = 'קרן ינוב';
UPDATE instructors SET rotation_order = 5 WHERE full_name = 'אורית צ''קול';
UPDATE instructors SET rotation_order = 6 WHERE full_name = 'רמי שמש';
UPDATE instructors SET rotation_order = 7 WHERE full_name = 'עליזה אברבנל';
UPDATE instructors SET rotation_order = 8 WHERE full_name = 'חוי פוקס';
UPDATE instructors SET rotation_order = 9 WHERE full_name = 'טל שומרת';

-- Verify
SELECT full_name, rotation_order FROM instructors WHERE rotation_order IS NOT NULL ORDER BY rotation_order;
