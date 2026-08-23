-- Migration: Add framework_name (שם המסגרת) to staffing_needs
-- Distinct from the existing "framework" column (מסגרת, e.g. "בי"ס") which holds the framework TYPE;
-- framework_name holds the specific institution's name.

ALTER TABLE staffing_needs
  ADD COLUMN IF NOT EXISTS framework_name TEXT;
