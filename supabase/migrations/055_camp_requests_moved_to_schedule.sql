-- Migration: Let admins mark when a camp request's lessons have been manually entered
-- into the real schedule board — camps intake doesn't create schedule rows itself
-- (see 049_create_camp_scheduling.sql), so this is a manual checkbox, not an automatic
-- conversion like staffing_assignments.converted_at.
ALTER TABLE camp_requests ADD COLUMN IF NOT EXISTS moved_to_schedule BOOLEAN NOT NULL DEFAULT false;
