-- Migration: Allow null lesson_plan_id in weekly_lesson_assignments
-- Purpose: Support equipment distribution without a specific lesson plan for a given week

ALTER TABLE weekly_lesson_assignments
  ALTER COLUMN lesson_plan_id DROP NOT NULL;
