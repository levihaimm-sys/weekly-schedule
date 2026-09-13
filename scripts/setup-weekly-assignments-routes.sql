-- Set up the "הקצאות שבועיות" (weekly assignments) table for the new school year:
-- creates the one missing instructor, and sets route (מסלול) + rotation_order (column
-- position) for the 9 instructors who should appear, in this order:
--   ישרש | רמת גן | גבעתיים | תל אביב | ראש העין | ראש העין | ראש העין | הוד השרון | לב השרון
--   אריאל ברמן | קארין גינתי | ליאור חדש | עדי שאמו | מורן דגיר | עליזה אברבנל | חוי פוקס | טל שומרת | אילת סופר
--
-- Does NOT touch weekly_lesson_assignments / equipment_confirmations, so any equipment
-- already distributed this week stays exactly as-is.

-- Step 1: create ליאור חדש if she doesn't already exist (no phone yet -> no login;
-- add one later from the Instructors page if she needs to sign in)
INSERT INTO instructors (full_name, status)
SELECT 'ליאור חדש', 'active'
WHERE NOT EXISTS (SELECT 1 FROM instructors WHERE full_name = 'ליאור חדש');

-- Step 2: set route + rotation_order (1-9) for the 9 instructors
UPDATE instructors SET route = 'ישרש',      rotation_order = 1 WHERE full_name = 'אריאל ברמן';
UPDATE instructors SET route = 'רמת גן',     rotation_order = 2 WHERE full_name = 'קארין גינתי';
UPDATE instructors SET route = 'גבעתיים',    rotation_order = 3 WHERE full_name = 'ליאור חדש';
UPDATE instructors SET route = 'תל אביב',    rotation_order = 4 WHERE full_name = 'עדי שאמו';
UPDATE instructors SET route = 'ראש העין',   rotation_order = 5 WHERE full_name = 'מורן דגיר';
UPDATE instructors SET route = 'ראש העין',   rotation_order = 6 WHERE full_name = 'עליזה אברבנל';
UPDATE instructors SET route = 'ראש העין',   rotation_order = 7 WHERE full_name = 'חוי פוקס';
UPDATE instructors SET route = 'הוד השרון',  rotation_order = 8 WHERE full_name = 'טל שומרת';
UPDATE instructors SET route = 'לב השרון',   rotation_order = 9 WHERE full_name = 'אילת סופר';

-- Step 3: remove anyone else currently in the table who isn't one of these 9
-- (only clears their column position - their assignment history is untouched)
UPDATE instructors
SET rotation_order = NULL
WHERE rotation_order IS NOT NULL
  AND full_name NOT IN (
    'אריאל ברמן', 'קארין גינתי', 'ליאור חדש', 'עדי שאמו', 'מורן דגיר',
    'עליזה אברבנל', 'חוי פוקס', 'טל שומרת', 'אילת סופר'
  );

-- Verify
SELECT full_name, route, rotation_order
FROM instructors
WHERE rotation_order IS NOT NULL
ORDER BY rotation_order;
