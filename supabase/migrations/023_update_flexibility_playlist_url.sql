-- Migration: Update flexibility lesson plans playlist URL
-- Created: 2026-05-19
-- Purpose: Update the playlist_url for all "גמישות ותנועה" lesson plans
--          to the new playlist link.

UPDATE lesson_plans
SET playlist_url = 'https://hspisrael.wixsite.com/newbuli/copy-of-%D7%9E%D7%99%D7%95%D7%9E%D7%A0%D7%95%D7%99%D7%95%D7%AA-%D7%99%D7%A1%D7%95%D7%93'
WHERE category = 'גמישות ותנועה';
