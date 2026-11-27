-- WhatsApp bot pages (/bot): which bot accounts each admin may see.
-- 'personal' = Haim's private number, 'business' = the nonprofit's number.
-- Empty = no WhatsApp section in the sidebar.
alter table public.profiles add column if not exists wa_accounts text[] not null default '{}';

update public.profiles set wa_accounts = '{personal,business}' where id = '5ba08f13-aae9-4550-8d58-33bcdf5ae04b'; -- חיים
update public.profiles set wa_accounts = '{business}' where id = '508834c7-a00b-4ce1-bf56-d00a59cd5529'; -- שירן

-- Admins may edit each other's profiles, but nobody may widen WhatsApp access
-- through the app or the API: only the SQL editor / service role can.
create or replace function public.lock_wa_accounts()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') in ('authenticated', 'anon') then
    if (tg_op = 'INSERT' and new.wa_accounts <> '{}')
       or (tg_op = 'UPDATE' and new.wa_accounts is distinct from old.wa_accounts) then
      raise exception 'wa_accounts can only be changed by the owner from the database';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists lock_wa_accounts on public.profiles;
create trigger lock_wa_accounts before insert or update on public.profiles
for each row execute function public.lock_wa_accounts();
