-- Migration: Track the amount of money offered to a potential instructor during recruitment talks.

ALTER TABLE staffing_potential_instructors ADD COLUMN IF NOT EXISTS offered_amount NUMERIC;
