-- הוספת שדה status למדריכים עם 3 אפשרויות
-- active = פעיל
-- substitute = משלים/זמני
-- inactive = לא פעיל

-- הוספת העמודה
ALTER TABLE instructors
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
CHECK (status IN ('active', 'substitute', 'inactive'));

-- עדכון כל המדריכים הקיימים להיות "פעיל" (אם is_active = true)
UPDATE instructors
SET status = CASE
  WHEN is_active = true THEN 'active'
  ELSE 'inactive'
END
WHERE status IS NULL;

-- הוספת comment להסבר
COMMENT ON COLUMN instructors.status IS
'סטטוס המדריך: active (פעיל), substitute (משלים/זמני), inactive (לא פעיל)';
