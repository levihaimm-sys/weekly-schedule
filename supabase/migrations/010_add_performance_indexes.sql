-- Migration: Add performance indexes
-- Created: 2026-02-11
-- Purpose: Optimize common queries for faster performance

-- Index for instructor lessons queries (most common query in app)
-- Used in: /today, /my-schedule, /confirm-lessons
CREATE INDEX IF NOT EXISTS idx_lessons_instructor_date 
  ON lessons(instructor_id, lesson_date DESC);

-- Index for daily dashboard queries
-- Used in: admin dashboard "today's lessons"
CREATE INDEX IF NOT EXISTS idx_lessons_date 
  ON lessons(lesson_date DESC);

-- Index for signature lookups
-- Used in: every lesson display to check if confirmed
CREATE INDEX IF NOT EXISTS idx_signatures_lesson 
  ON signatures(lesson_id);

-- Index for profile to instructor mapping
-- Used in: login and every page load
CREATE INDEX IF NOT EXISTS idx_profiles_instructor 
  ON profiles(instructor_id);

-- Index for recurring schedule lookups
-- Used in: schedule replication
CREATE INDEX IF NOT EXISTS idx_lessons_recurring 
  ON lessons(recurring_item_id, lesson_date);

-- Composite index for instructor requests (admin dashboard)
-- Used in: pending requests list
CREATE INDEX IF NOT EXISTS idx_lessons_instructor_requests
  ON lessons(instructor_absence_request, instructor_request_handled, lesson_date DESC)
  WHERE instructor_absence_request = true;

-- Index for location queries
-- Used in: filters and reports
CREATE INDEX IF NOT EXISTS idx_locations_city 
  ON locations(city);

-- Verify indexes were created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
