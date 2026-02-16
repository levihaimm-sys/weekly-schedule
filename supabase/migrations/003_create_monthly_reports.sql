-- Create monthly_reports table
CREATE TABLE IF NOT EXISTS monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES instructors(id),
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL,
  pdf_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  generated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(instructor_id, month, year)
);

-- Enable RLS
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;

-- Admins can manage all reports
CREATE POLICY "Admins can manage reports" ON monthly_reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Instructors can read their own reports
CREATE POLICY "Instructors can read own reports" ON monthly_reports
  FOR SELECT USING (
    instructor_id = (SELECT instructor_id FROM profiles WHERE id = auth.uid())
  );
