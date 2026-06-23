-- Add free-text status note to tasks
ALTER TABLE tasks ADD COLUMN status_note TEXT DEFAULT '';
