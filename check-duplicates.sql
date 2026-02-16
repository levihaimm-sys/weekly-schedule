-- Check for duplicate lessons for a specific instructor
-- Replace 'instructor_id_here' with the actual instructor_id of טל שומרת

-- Find duplicate lessons (same instructor, location, date, time)
SELECT
  instructor_id,
  location_id,
  lesson_date,
  start_time,
  COUNT(*) as duplicate_count
FROM lessons
WHERE instructor_id = (
  SELECT id FROM instructors WHERE full_name LIKE '%טל%'
)
GROUP BY instructor_id, location_id, lesson_date, start_time
HAVING COUNT(*) > 1
ORDER BY lesson_date, start_time;

-- Show all lessons for טל in the current week
SELECT
  l.id,
  l.lesson_date,
  l.start_time,
  l.status,
  i.full_name as instructor_name,
  loc.name as location_name
FROM lessons l
LEFT JOIN instructors i ON l.instructor_id = i.id
LEFT JOIN locations loc ON l.location_id = loc.id
WHERE i.full_name LIKE '%טל%'
  AND l.lesson_date >= CURRENT_DATE
  AND l.lesson_date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY l.lesson_date, l.start_time;
