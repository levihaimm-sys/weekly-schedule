-- Migration: Add seriousness status and free-text details to recruitment candidates
-- Purpose: Track process seriousness separately from progress status, and allow a persistent candidate profile note

ALTER TABLE recruitment_candidates
  ADD COLUMN IF NOT EXISTS seriousness_status TEXT NOT NULL DEFAULT 'initial_screening'
    CHECK (seriousness_status IN ('inactive', 'initial_screening', 'question_mark', 'hot_active')),
  ADD COLUMN IF NOT EXISTS details TEXT;
