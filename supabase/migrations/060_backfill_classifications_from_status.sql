-- Consolidates the old single-select status (פעיל/משלים/לא פעיל) into the
-- multi-select classifications field so no existing data is lost. Only
-- backfills instructors that don't already have a classification set.
UPDATE instructors
SET classifications = CASE status
  WHEN 'active' THEN ARRAY['regular']
  WHEN 'substitute' THEN ARRAY['fill_in']
  WHEN 'inactive' THEN ARRAY['inactive']
  ELSE ARRAY['regular']
END
WHERE classifications IS NULL OR classifications = '{}';
