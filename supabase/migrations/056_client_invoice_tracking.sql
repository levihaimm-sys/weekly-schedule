-- Invoice group splits: defines how a client's locations are divided into separate invoices
create table client_invoice_groups (
  id uuid default gen_random_uuid() primary key,
  client_name text not null,
  group_label text not null,
  location_names text[] not null default '{}',
  is_remainder boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- Monthly invoice status tracking
create table client_invoices (
  id uuid default gen_random_uuid() primary key,
  client_name text not null,
  group_id uuid not null references client_invoice_groups(id) on delete cascade,
  year int not null,
  month int not null,
  amount numeric not null default 0,
  invoice_number text,
  sent_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  unique(group_id, year, month)
);

-- RLS
alter table client_invoice_groups enable row level security;
alter table client_invoices enable row level security;

create policy "Authenticated users can read invoice groups"
  on client_invoice_groups for select to authenticated using (true);
create policy "Authenticated users can manage invoice groups"
  on client_invoice_groups for all to authenticated using (true) with check (true);

create policy "Authenticated users can read invoices"
  on client_invoices for select to authenticated using (true);
create policy "Authenticated users can manage invoices"
  on client_invoices for all to authenticated using (true) with check (true);

-- Seed: יובל חינוך split
insert into client_invoice_groups (client_name, group_label, location_names, is_remainder, sort_order) values
  ('יובל חינוך', 'באר, מניפה, זיו, מכחול, ששון, שמחה, יונה', ARRAY['באר', 'מניפה', 'זיו', 'מכחול', 'ששון', 'שמחה', 'יונה'], false, 1),
  ('יובל חינוך', 'שאר הגנים', '{}', true, 2);
