-- Fixed-schedule changes must never rewrite history.
-- Past lessons read their name/frame/address from their recurring_schedule row, so:
--  * editing a row first moves its past lessons onto a frozen copy (archived_at set)
--  * deleting a row that has past lessons archives it instead of deleting it
-- Archived rows are hidden from the fixed schedule and never generate new lessons.
alter table public.recurring_schedule add column if not exists archived_at date;
create index if not exists recurring_schedule_active_idx on public.recurring_schedule (archived_at) where archived_at is null;

-- Undo stack for the fixed + weekly schedule boards ("בטל" button).
-- Each entry stores the rows as they were before the change, plus the ids the change created.
create table if not exists public.schedule_undo_log (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  created_at timestamptz not null default now(),
  created_by uuid,
  before_recurring jsonb not null default '[]'::jsonb,
  before_lessons jsonb not null default '[]'::jsonb,
  created_recurring_ids uuid[] not null default '{}',
  created_lesson_ids uuid[] not null default '{}'
);
create index if not exists schedule_undo_log_created_at_idx on public.schedule_undo_log (created_at desc);

-- Accessed only through the service-role client in server actions.
alter table public.schedule_undo_log enable row level security;
