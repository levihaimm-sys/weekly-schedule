-- Subtasks: a task can belong to a parent task. Deleting the parent deletes its subtasks.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id);
