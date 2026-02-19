-- ============================================================
-- Populate weekly_lesson_assignments based on rotation schedule
-- Generated from the Annual Schedule image
--
-- Rotation order: סתיו(1) → אריאל(2) → קרן(3) → טליה(4) → אורית(5) → רמי(6) → עליזה(7) → חוי(8) → טל(9)
-- Each week: everyone shifts by 1, new lesson enters at סתיו
-- ============================================================

-- Step 1: Fix rotation order (קרן before טליה)
UPDATE instructors SET rotation_order = 3 WHERE full_name = 'קרן ינוב';
UPDATE instructors SET rotation_order = 4 WHERE full_name = 'טליה דודזון';

-- Step 2: Clear existing future assignments
DELETE FROM weekly_lesson_assignments
WHERE week_start_date >= '2026-02-01';

-- Step 3: Insert all assignments
DO $$
DECLARE
  v_count INT := 0;

  -- Rotation sequence: 30 lesson names (8 pre-existing + 22 new)
  -- Index 1-8 = pre-existing (in rotation at start, oldest to newest)
  -- Index 9-30 = new lessons entering at סתיו each week
  lesson_names TEXT[] := ARRAY[
    'מיומנות יסוד 3',    -- idx 1  (pre-existing, oldest - in טל on 01/02)
    'מיומנות יסוד 9',    -- idx 2  (in חוי on 01/02)
    'גמישות תנועה 3',   -- idx 3  (in עליזה on 01/02)
    'מיומנות יסוד 5',    -- idx 4  (in רמי on 01/02)
    'מיומנות יסוד 10',   -- idx 5  (in אורית on 01/02)
    'שיווי משקל 1',      -- idx 6  (in טליה on 01/02)
    'פתיחת שנה 4',      -- idx 7  (in קרן on 01/02)
    'שיווי משקל 2',      -- idx 8  (in אריאל on 01/02)
    'שיווי משקל 3',      -- idx 9  (enters 01/02 - סתיו)
    'שיווי משקל 4',      -- idx 10 (enters 08/02)
    'שיווי משקל 5',      -- idx 11 (enters 15/02)
    'שיווי משקל 6',      -- idx 12 (enters 22/02)
    'שיווי משקל 7',      -- idx 13 (enters 01/03)
    'שיווי משקל 8',      -- idx 14 (enters 08/03)
    'שיווי משקל 9',      -- idx 15 (enters 15/03)
    'שיווי משקל 10',     -- idx 16 (enters 22/03)
    'שיווי משקל 11',     -- idx 17 (enters 29/03)
    'שיווי משקל 12',     -- idx 18 (enters 05/04)
    'שיווי משקל 13',     -- idx 19 (enters 12/04)
    'משחקי כדור 1',      -- idx 20 (enters 19/04)
    'משחקי כדור 2',      -- idx 21 (enters 26/04)
    'משחקי כדור 3',      -- idx 22 (enters 03/05)
    'משחקי כדור 4',      -- idx 23 (enters 10/05)
    'משחקי כדור 5',      -- idx 24 (enters 17/05)
    'משחקי כדור 6',      -- idx 25 (enters 24/05)
    'משחקי כדור 7',      -- idx 26 (enters 31/05)
    'משחקי כדור 8',      -- idx 27 (enters 07/06)
    'גמישות ותנועה 1',   -- idx 28 (enters 14/06)
    'גמישות ותנועה 2',   -- idx 29 (enters 21/06)
    'גמישות ותנועה 3'    -- idx 30 (enters 28/06)
  ];

  v_week_date DATE;
  v_week_offset INT;
  v_inst RECORD;
  v_lesson_idx INT;
  v_lesson_name TEXT;
  v_lesson_id UUID;
BEGIN
  -- For each of 22 weeks
  FOR v_week_offset IN 0..21 LOOP
    v_week_date := '2026-02-01'::DATE + (v_week_offset * 7);

    -- For each instructor
    FOR v_inst IN
      SELECT id, full_name, rotation_order
      FROM instructors
      WHERE rotation_order IS NOT NULL AND is_active = true
      ORDER BY rotation_order
    LOOP
      -- Calculate lesson index in the array
      -- At week_offset=0, rotation_order=1 → index 9 (שיווי משקל 3)
      -- At week_offset=0, rotation_order=9 → index 1 (מיומנות יסוד 3)
      -- Formula: 9 + week_offset - (rotation_order - 1)
      v_lesson_idx := 9 + v_week_offset - (v_inst.rotation_order - 1);

      -- Skip if out of range
      IF v_lesson_idx < 1 OR v_lesson_idx > 30 THEN
        CONTINUE;
      END IF;

      v_lesson_name := lesson_names[v_lesson_idx];

      -- Look up lesson plan by name
      SELECT id INTO v_lesson_id
      FROM lesson_plans
      WHERE name = v_lesson_name;

      IF v_lesson_id IS NULL THEN
        RAISE NOTICE 'Lesson plan not found: "%"', v_lesson_name;
        CONTINUE;
      END IF;

      -- Insert assignment (upsert)
      INSERT INTO weekly_lesson_assignments (instructor_id, lesson_plan_id, week_start_date, is_permanent_change)
      VALUES (v_inst.id, v_lesson_id, v_week_date, false)
      ON CONFLICT (instructor_id, week_start_date) DO UPDATE
        SET lesson_plan_id = EXCLUDED.lesson_plan_id,
            updated_at = now();

      v_count := v_count + 1;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Done! Inserted/updated % assignments', v_count;
END $$;

-- ============================================================
-- Verify: Show assignments for current week (15/02/2026)
-- ============================================================
SELECT
  i.full_name,
  i.rotation_order,
  lp.name AS lesson_plan,
  wla.week_start_date
FROM weekly_lesson_assignments wla
JOIN instructors i ON i.id = wla.instructor_id
JOIN lesson_plans lp ON lp.id = wla.lesson_plan_id
WHERE wla.week_start_date = '2026-02-15'
ORDER BY i.rotation_order;

-- Show all assignments summary
SELECT
  to_char(wla.week_start_date, 'DD/MM') AS week,
  COUNT(*) AS assignments
FROM weekly_lesson_assignments wla
WHERE wla.week_start_date >= '2026-02-01'
GROUP BY wla.week_start_date
ORDER BY wla.week_start_date;
