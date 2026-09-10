-- Migration: Add a coordinator/organizer name field (רכזת) to camp requests
ALTER TABLE camp_requests ADD COLUMN IF NOT EXISTS coordinator_name TEXT;
