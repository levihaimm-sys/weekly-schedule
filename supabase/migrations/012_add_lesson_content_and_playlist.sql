-- Migration: Add content and playlist URL to lesson plans
-- Created: 2026-02-11
-- Purpose: Allow displaying lesson content in-app and linking to music playlists

-- Add content field for rich text lesson plan content
ALTER TABLE lesson_plans 
  ADD COLUMN IF NOT EXISTS content TEXT;

-- Add playlist URL field for Wix music playlists
ALTER TABLE lesson_plans 
  ADD COLUMN IF NOT EXISTS playlist_url TEXT;

COMMENT ON COLUMN lesson_plans.content IS 'תוכן המערך בפורמט HTML - להצגה בתוך האפליקציה';
COMMENT ON COLUMN lesson_plans.playlist_url IS 'קישור לרשימת השמעה בוויקס למערך זה';
