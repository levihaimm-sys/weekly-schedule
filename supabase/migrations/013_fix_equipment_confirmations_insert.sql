-- Fix: Add INSERT policy for equipment_confirmations
-- Instructors need to be able to create their own confirmations

CREATE POLICY "Instructors can insert own confirmations" ON equipment_confirmations
  FOR INSERT WITH CHECK (
    instructor_id = (SELECT instructor_id FROM profiles WHERE id = auth.uid())
  );
