-- Enable RLS on existing tables and add policies

-- === INSTRUCTORS ===
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read instructors" ON instructors
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage instructors" ON instructors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- === LOCATIONS ===
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read locations" ON locations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage locations" ON locations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- === RECURRING_SCHEDULE ===
ALTER TABLE recurring_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage recurring schedule" ON recurring_schedule
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Instructors can read own recurring schedule" ON recurring_schedule
  FOR SELECT USING (
    instructor_id = (SELECT instructor_id FROM profiles WHERE id = auth.uid())
  );

-- === LESSONS ===
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage lessons" ON lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Instructors can read own lessons" ON lessons
  FOR SELECT USING (
    instructor_id = (SELECT instructor_id FROM profiles WHERE id = auth.uid())
    OR substitute_instructor_id = (SELECT instructor_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Instructors can update own lesson status" ON lessons
  FOR UPDATE USING (
    instructor_id = (SELECT instructor_id FROM profiles WHERE id = auth.uid())
  );
