-- Travel pay can be per work day (existing behavior) or per activity.
-- Chosen per instructor+client+city rate row in רווח והפסד > פירוט מדריכים.

ALTER TABLE instructor_pay_rates
  ADD COLUMN IF NOT EXISTS travel_mode TEXT NOT NULL DEFAULT 'per_day'
    CHECK (travel_mode IN ('per_day', 'per_activity'));

-- טלי אריאב (10 ש"ח) ומורן דגיר (5 ש"ח) - נסיעות לפי פעילות
UPDATE instructor_pay_rates
  SET travel_mode = 'per_activity'
  WHERE instructor_id IN (
    '63146773-5adb-4d4d-8fae-0d5ae4f1e16c',
    '8bc64b36-a212-41bf-bec0-78d91eecd7d4'
  );
