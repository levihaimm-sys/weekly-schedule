-- Instructors could only read a recurring_schedule row when that row's own instructor_id
-- matched them. But some recurring_schedule rows have instructor_id = null (e.g. group
-- classes without one fixed owner), even though a real lesson generated from that row is
-- correctly assigned to a specific instructor via lessons.instructor_id. Those instructors
-- were silently blocked from reading the framework's address/manager_name/manager_phone.
--
-- Broaden read access: an instructor may read a recurring_schedule row either because they're
-- its fixed owner, or because they have an actual lesson instance pointing to it.
DROP POLICY IF EXISTS "Instructors can read own recurring schedule" ON recurring_schedule;

CREATE POLICY "Instructors can read own recurring schedule" ON recurring_schedule
  FOR SELECT USING (
    instructor_id = (SELECT instructor_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.recurring_item_id = recurring_schedule.id
      AND lessons.instructor_id = (SELECT instructor_id FROM profiles WHERE id = auth.uid())
    )
  );
