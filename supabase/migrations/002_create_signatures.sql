-- Create signatures table
CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  signer_name TEXT NOT NULL,
  signer_role TEXT DEFAULT 'teacher',
  signature_url TEXT NOT NULL,
  signed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- One signature per lesson
ALTER TABLE signatures ADD CONSTRAINT unique_lesson_signature UNIQUE (lesson_id);

-- Enable RLS
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- Admins can read all signatures
CREATE POLICY "Admins can read all signatures" ON signatures
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Instructors can insert signatures for their own lessons
CREATE POLICY "Instructors can insert signatures for own lessons" ON signatures
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = signatures.lesson_id
      AND (lessons.instructor_id = (
        SELECT instructor_id FROM profiles WHERE id = auth.uid()
      ))
    )
  );

-- Instructors can read their own lesson signatures
CREATE POLICY "Instructors can read own signatures" ON signatures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = signatures.lesson_id
      AND (lessons.instructor_id = (
        SELECT instructor_id FROM profiles WHERE id = auth.uid()
      ))
    )
  );
