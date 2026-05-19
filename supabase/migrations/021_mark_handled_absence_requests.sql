-- Migration: Mark past absence requests as handled
-- Created: 2026-05-19
-- Purpose: Retroactively mark instructor absence requests as handled
--          for lessons that have already passed (lesson_date < today).
--          The getInstructorRequests query already filters to today+,
--          but this clears the backlog so the flag is consistent.

UPDATE lessons
SET instructor_request_handled = true
WHERE instructor_absence_request = true
  AND instructor_request_handled = false
  AND lesson_date < CURRENT_DATE;
