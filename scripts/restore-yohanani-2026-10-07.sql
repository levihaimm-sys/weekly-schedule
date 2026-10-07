-- One-off restore of the 2026-10-07 fixed-schedule change at "יוחנני" (הרצליה):
-- 3 Tuesday rows were deleted (their 9 past lessons lost their name) and the 13:30 row was
-- renamed to "נוף ים" and moved to Wednesday. This puts all 4 Tuesday rows back, relinks the
-- orphaned past lessons, and swaps the Wednesday future lessons back to Tuesdays.
begin;

update recurring_schedule set day_of_week = 2, group_name = 'יוחנני'
where id = '164eef8d-a38c-40ec-8902-079fe2ee2348';

with base as (select * from recurring_schedule where id = '164eef8d-a38c-40ec-8902-079fe2ee2348'),
ins as (
  insert into recurring_schedule (location_id, instructor_id, day_of_week, start_time, group_name, client_name, address,
    manager_name, contact_name, framework, framework_name, field, lesson_duration, lessons_count, notes, client_id, manager_phone)
  select b.location_id, b.instructor_id, 2, t.st::time, b.group_name, b.client_name, b.address,
    b.manager_name, b.contact_name, b.framework, b.framework_name, b.field, b.lesson_duration, b.lessons_count, b.notes, b.client_id, b.manager_phone
  from base b cross join (values ('14:10'), ('14:50'), ('15:30')) t(st)
  returning id, start_time
)
update lessons l set recurring_item_id = ins.id
from ins
where l.location_id = 'd524a9a9-c917-4a53-9afe-3bead7fb1320'
  and l.recurring_item_id is null
  and l.lesson_date < '2026-10-07'
  and ((ins.start_time = '14:10' and l.start_time in ('14:05', '14:10'))
    or (ins.start_time = '14:50' and l.start_time in ('14:45', '14:50'))
    or (ins.start_time = '15:30' and l.start_time in ('12:45', '15:30')));

delete from lessons
where recurring_item_id = '164eef8d-a38c-40ec-8902-079fe2ee2348' and lesson_date >= '2026-10-07';

insert into lessons (recurring_item_id, location_id, instructor_id, lesson_date, start_time, status)
select r.id, r.location_id, r.instructor_id, d::date, r.start_time, 'scheduled'
from recurring_schedule r
cross join (values ('2026-10-13'), ('2026-10-20'), ('2026-10-27'), ('2026-11-03')) v(d)
where r.location_id = 'd524a9a9-c917-4a53-9afe-3bead7fb1320';

commit;

-- Check: expect 4 rows on day 2, group "יוחנני", each with past lessons and 4 future lessons.
select r.start_time, r.day_of_week, r.group_name,
  count(l.*) filter (where l.lesson_date < '2026-10-07') as past,
  count(l.*) filter (where l.lesson_date >= '2026-10-07') as future
from recurring_schedule r
left join lessons l on l.recurring_item_id = r.id
where r.location_id = 'd524a9a9-c917-4a53-9afe-3bead7fb1320'
group by 1, 2, 3 order by 1;
