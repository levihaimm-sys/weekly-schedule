-- Migration: Allow same lesson plan to be assigned to multiple instructors in the same week
-- Purpose: Remove the unique constraint so two instructors can share the same lesson plan

ALTER TABLE weekly_lesson_assignments
  DROP CONSTRAINT unique_lesson_per_week;
