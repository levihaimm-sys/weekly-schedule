-- Add a fourth staffing_needs status: "safe_assignment" (שיבוץ בטוח), sitting between
-- partially_filled (renamed to "שיבוץ זמני" in the UI) and filled. Admin-set only via
-- updateNeedStatus — the automatic recomputeNeedStatus() logic never assigns it.

ALTER TABLE staffing_needs DROP CONSTRAINT IF EXISTS staffing_needs_status_check;

ALTER TABLE staffing_needs
  ADD CONSTRAINT staffing_needs_status_check
  CHECK (status IN ('open', 'partially_filled', 'safe_assignment', 'filled'));
