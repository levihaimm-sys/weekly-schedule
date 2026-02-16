-- Update PDF paths based on lesson name instead of category
-- This is more reliable since names have clear patterns

-- First, let's see all lesson names
SELECT id, name, category, pdf_path
FROM lesson_plans
ORDER BY name;

-- Update based on name patterns
WITH numbered_lessons AS (
  SELECT
    id,
    name,
    category,
    pdf_path,
    CASE
      WHEN name LIKE '%פתיחת שנה%' OR name LIKE '%פתיחה%' THEN 'opening'
      WHEN name LIKE '%מיומנות יסוד%' OR name LIKE '%מיומנויות%' THEN 'basic'
      WHEN name LIKE '%שיווי משקל%' OR name LIKE '%משקל%' THEN 'balance'
      WHEN name LIKE '%משחק%כדור%' OR name LIKE '%כדור%' THEN 'ball'
      WHEN name LIKE '%גמישות%' OR name LIKE '%תנועה%' THEN 'flex'
      ELSE 'unknown'
    END as prefix,
    ROW_NUMBER() OVER (
      PARTITION BY CASE
        WHEN name LIKE '%פתיחת שנה%' OR name LIKE '%פתיחה%' THEN 'opening'
        WHEN name LIKE '%מיומנות יסוד%' OR name LIKE '%מיומנויות%' THEN 'basic'
        WHEN name LIKE '%שיווי משקל%' OR name LIKE '%משקל%' THEN 'balance'
        WHEN name LIKE '%משחק%כדור%' OR name LIKE '%כדור%' THEN 'ball'
        WHEN name LIKE '%גמישות%' OR name LIKE '%תנועה%' THEN 'flex'
        ELSE 'unknown'
      END
      ORDER BY name
    ) as lesson_number
  FROM lesson_plans
)
UPDATE lesson_plans
SET pdf_path = numbered_lessons.prefix || '-lesson-' || numbered_lessons.lesson_number || '.pdf'
FROM numbered_lessons
WHERE lesson_plans.id = numbered_lessons.id;

-- Verify
SELECT name, category, pdf_path
FROM lesson_plans
ORDER BY category, name;
