-- Allow the quantity shown to instructors to differ from the plan's required quantity
-- (e.g. handing out 40 sticks when the plan calls for 35, to cover breakage/loss).
-- Falls back to lesson_plan_equipment.quantity when null.
ALTER TABLE lesson_plan_equipment
ADD COLUMN IF NOT EXISTS instructor_quantity INTEGER;
