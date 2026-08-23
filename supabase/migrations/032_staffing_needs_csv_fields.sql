-- Migration: Add fields needed to CSV-import client lesson needs
-- (עיר/כתובת/מתחם/מנהל/ת/קב'/מסגרת/חוג/יום/תאריך התחלה)
-- start_date kept as free text since the source spreadsheets don't use one consistent date format.

ALTER TABLE staffing_needs
  ADD COLUMN IF NOT EXISTS manager_name TEXT,
  ADD COLUMN IF NOT EXISTS framework TEXT,
  ADD COLUMN IF NOT EXISTS start_date TEXT;
