-- Tasks: free-text "next action" and a priority flag (priority tasks show first)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS next_action TEXT DEFAULT '';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_priority BOOLEAN NOT NULL DEFAULT false;
