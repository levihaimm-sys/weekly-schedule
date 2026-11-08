-- Add notes field to locations (visible to admin + optionally to instructors)
alter table locations add column if not exists notes text;
alter table locations add column if not exists hide_notes_from_instructor boolean not null default false;
