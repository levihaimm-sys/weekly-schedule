-- Migration: Update sports lesson plans playlist URL
-- Created: 2026-05-19
-- Purpose: Update the playlist_url for all sports lesson plans (משחקי כדור category)
--          to the new playlist link.

UPDATE lesson_plans
SET playlist_url = 'https://hspisrael.wixsite.com/newbuli/copy-of-7'
WHERE category = 'משחקי כדור';
