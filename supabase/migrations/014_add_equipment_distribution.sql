-- Add equipment distribution tracking to weekly_lesson_assignments
ALTER TABLE weekly_lesson_assignments
ADD COLUMN IF NOT EXISTS equipment_distributed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS equipment_distributed_at TIMESTAMPTZ;

-- Add route field to instructors for grouping in distribution
ALTER TABLE instructors
ADD COLUMN IF NOT EXISTS route TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_weekly_assignments_equipment 
ON weekly_lesson_assignments(week_start_date, equipment_distributed);

-- Update existing assignments to have equipment_distributed = false
UPDATE weekly_lesson_assignments
SET equipment_distributed = FALSE
WHERE equipment_distributed IS NULL;
