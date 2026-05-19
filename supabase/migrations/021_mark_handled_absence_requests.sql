-- Migration: Clear handled absence request flags
-- Created: 2026-05-19
-- Purpose: Retroactively fix lessons where an absence was reported but a new
--          instructor was already assigned (instructor_request_handled = true).
--          These lessons should look and behave like normal scheduled lessons.
--          Also clears flags for all past-date absence requests since those
--          lessons have already happened and need no further action.

-- 1. Clear flags where absence was already marked as handled
--    (admin assigned a new instructor but the flags weren't fully cleared)
UPDATE lessons
SET instructor_absence_request = false,
    instructor_request_handled = false
WHERE instructor_absence_request = true
  AND instructor_request_handled = true;

-- 2. Clear flags for past lessons that still have unhandled absence requests
--    (the day already passed — no action needed)
UPDATE lessons
SET instructor_absence_request = false,
    instructor_request_handled = false
WHERE instructor_absence_request = true
  AND instructor_request_handled = false
  AND lesson_date < CURRENT_DATE;
