-- Create instructor_availability table
-- Stores which days and cities each instructor is available to work

CREATE TABLE instructor_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID REFERENCES instructors(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 4), -- 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu
  city TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(instructor_id, day_of_week, city)
);

-- Enable RLS
ALTER TABLE instructor_availability ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated access" ON instructor_availability
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Index for fast lookups by instructor
CREATE INDEX idx_instructor_availability_instructor ON instructor_availability(instructor_id);
