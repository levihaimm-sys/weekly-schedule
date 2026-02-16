-- Update PDF paths for all lesson plans
-- This maps Hebrew categories to English file names in Storage

-- First, let's see what we have
SELECT id, name, category, pdf_path
FROM lesson_plans
ORDER BY category, name;

-- Update paths based on category and add sequential numbers
-- We'll use ROW_NUMBER() to assign numbers within each category

WITH numbered_lessons AS (
  SELECT
    id,
    name,
    category,
    pdf_path,
    CASE
      WHEN category LIKE '%פתיחת שנה%' THEN 'opening'
      WHEN category LIKE '%מיומנות יסוד%' OR category LIKE '%מיומנת יסוד%' THEN 'basic'
      WHEN category LIKE '%שיווי משקל%' THEN 'balance'
      WHEN category LIKE '%משחקי כדור%' THEN 'ball'
      WHEN category LIKE '%גמישות%' THEN 'flex'
      ELSE 'unknown'
    END as prefix,
    ROW_NUMBER() OVER (
      PARTITION BY category
      ORDER BY name
    ) as lesson_number
  FROM lesson_plans
)
UPDATE lesson_plans
SET pdf_path = numbered_lessons.prefix || '-lesson-' || numbered_lessons.lesson_number || '.pdf'
FROM numbered_lessons
WHERE lesson_plans.id = numbered_lessons.id;

-- Verify the updates
SELECT name, category, pdf_path
FROM lesson_plans
ORDER BY category, name;
