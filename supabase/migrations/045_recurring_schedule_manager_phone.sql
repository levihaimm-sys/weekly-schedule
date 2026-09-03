-- Migration: Add manager_phone (טלפון גננת/רכזת) to recurring_schedule, so the
-- instructor app can show a phone number alongside the existing manager_name.

ALTER TABLE recurring_schedule
  ADD COLUMN IF NOT EXISTS manager_phone TEXT;
