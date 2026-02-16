-- Migration: Create Lesson Plans System
-- Created: 2026-02-11
-- Purpose: Add lesson plans, equipment, and weekly assignments management

-- =============================================
-- 1. LESSON PLANS (מערכי שיעור)
-- =============================================
CREATE TABLE IF NOT EXISTS lesson_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 53),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  pdf_path TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Unique constraint: each week number should have only one lesson plan
  CONSTRAINT unique_week_number UNIQUE (week_number)
);

COMMENT ON TABLE lesson_plans IS 'מערכי שיעור - 53 מערכים שונים לאורך השנה';
COMMENT ON COLUMN lesson_plans.week_number IS 'מספר השבוע (1-53)';
COMMENT ON COLUMN lesson_plans.name IS 'שם המערך, לדוגמה: "פתיחת שנה 1", "שיווי משקל 3"';
COMMENT ON COLUMN lesson_plans.category IS 'קטגוריה/נושא: פתיחת שנה, מיומנות יסוד, שיווי משקל, משחקי כדור, גמישות ותנועה';
COMMENT ON COLUMN lesson_plans.pdf_path IS 'נתיב לקובץ PDF של המערך';

-- =============================================
-- 2. EQUIPMENT (ציוד)
-- =============================================
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE equipment IS 'רשימת כל סוגי הציוד (כדורים, חישוקים, מקלות וכו׳)';
COMMENT ON COLUMN equipment.name IS 'שם הציוד, לדוגמה: "כדורי טניס", "חישוקים שטוחים"';

-- =============================================
-- 3. LESSON PLAN EQUIPMENT (ציוד לכל מערך)
-- =============================================
CREATE TABLE IF NOT EXISTS lesson_plan_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_plan_id UUID NOT NULL REFERENCES lesson_plans(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  equipment_type TEXT NOT NULL CHECK (equipment_type IN ('main', 'track', 'stamp')),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- One equipment item per lesson plan (can't have "כדורי טניס" twice in same lesson)
  CONSTRAINT unique_lesson_equipment UNIQUE (lesson_plan_id, equipment_id)
);

COMMENT ON TABLE lesson_plan_equipment IS 'קשר בין מערכי שיעור לציוד - מה צריך לכל מערך';
COMMENT ON COLUMN lesson_plan_equipment.quantity IS 'כמות הציוד הנדרשת (אם אין מספר בקובץ המקורי = 1)';
COMMENT ON COLUMN lesson_plan_equipment.equipment_type IS 'סוג הציוד: main (אביזרים), track (מסלול), stamp (חותמת)';

-- =============================================
-- 4. WEEKLY LESSON ASSIGNMENTS (חלוקה שבועית)
-- =============================================
CREATE TABLE IF NOT EXISTS weekly_lesson_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  lesson_plan_id UUID NOT NULL REFERENCES lesson_plans(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  is_permanent_change BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- One instructor can have only one lesson plan per week
  CONSTRAINT unique_instructor_week UNIQUE (instructor_id, week_start_date),
  
  -- Only one instructor can teach a specific lesson plan in a given week
  CONSTRAINT unique_lesson_per_week UNIQUE (lesson_plan_id, week_start_date)
);

COMMENT ON TABLE weekly_lesson_assignments IS 'חלוקה שבועית של מערכי שיעור למדריכים';
COMMENT ON COLUMN weekly_lesson_assignments.week_start_date IS 'תאריך תחילת השבוע (תמיד יום ראשון)';
COMMENT ON COLUMN weekly_lesson_assignments.is_permanent_change IS 'האם זה שינוי קבוע שמשפיע על כל השרשרת של המדריכים';

-- =============================================
-- 5. EQUIPMENT CONFIRMATIONS (אישורי קבלת ציוד)
-- =============================================
CREATE TABLE IF NOT EXISTS equipment_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES weekly_lesson_assignments(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  expected_quantity INT NOT NULL CHECK (expected_quantity > 0),
  received_quantity INT CHECK (received_quantity >= 0),
  is_confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- One confirmation per equipment item per assignment
  CONSTRAINT unique_assignment_equipment UNIQUE (assignment_id, equipment_id)
);

COMMENT ON TABLE equipment_confirmations IS 'אישורי קבלת ציוד - מה כל מדריך קיבל בפועל';
COMMENT ON COLUMN equipment_confirmations.expected_quantity IS 'כמות מצופה לפי המערך';
COMMENT ON COLUMN equipment_confirmations.received_quantity IS 'כמות שהמדריך דיווח שקיבל';
COMMENT ON COLUMN equipment_confirmations.is_confirmed IS 'האם המדריך אישר קבלת ציוד';
COMMENT ON COLUMN equipment_confirmations.confirmed_at IS 'מתי אושר (עד יום שני אחרי יום ראשון)';

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Quick lookup of assignments for a specific instructor
CREATE INDEX idx_assignments_instructor ON weekly_lesson_assignments(instructor_id, week_start_date DESC);

-- Quick lookup of assignments for a specific week
CREATE INDEX idx_assignments_week ON weekly_lesson_assignments(week_start_date DESC);

-- Quick lookup of equipment for a lesson plan
CREATE INDEX idx_lesson_equipment ON lesson_plan_equipment(lesson_plan_id);

-- Quick lookup of confirmations for an assignment
CREATE INDEX idx_confirmations_assignment ON equipment_confirmations(assignment_id);

-- Quick lookup of unconfirmed equipment
CREATE INDEX idx_confirmations_pending ON equipment_confirmations(is_confirmed) 
  WHERE is_confirmed = false;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_plan_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_lesson_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_confirmations ENABLE ROW LEVEL SECURITY;

-- LESSON PLANS: Everyone authenticated can read, admins can manage
CREATE POLICY "Anyone authenticated can read lesson plans" ON lesson_plans
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage lesson plans" ON lesson_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- EQUIPMENT: Everyone authenticated can read, admins can manage
CREATE POLICY "Anyone authenticated can read equipment" ON equipment
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage equipment" ON equipment
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- LESSON PLAN EQUIPMENT: Everyone authenticated can read, admins can manage
CREATE POLICY "Anyone authenticated can read lesson plan equipment" ON lesson_plan_equipment
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage lesson plan equipment" ON lesson_plan_equipment
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- WEEKLY ASSIGNMENTS: Instructors can read their own, admins can manage all
CREATE POLICY "Instructors can read own assignments" ON weekly_lesson_assignments
  FOR SELECT USING (
    instructor_id = (SELECT instructor_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage assignments" ON weekly_lesson_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- EQUIPMENT CONFIRMATIONS: Instructors can read/update their own, admins can read all
CREATE POLICY "Instructors can read own confirmations" ON equipment_confirmations
  FOR SELECT USING (
    instructor_id = (SELECT instructor_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Instructors can update own confirmations" ON equipment_confirmations
  FOR UPDATE USING (
    instructor_id = (SELECT instructor_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage confirmations" ON equipment_confirmations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lesson_plans_updated_at
  BEFORE UPDATE ON lesson_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_lesson_assignments_updated_at
  BEFORE UPDATE ON weekly_lesson_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
