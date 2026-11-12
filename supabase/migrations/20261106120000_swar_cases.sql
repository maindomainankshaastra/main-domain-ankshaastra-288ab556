-- Swar Calculator cases: one row per customer, with a status that moves automatically
-- (WhatsApp sent / report downloaded) and can also be changed by hand in the admin panel.

create table if not exists public.swar_cases (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  order_id        text,
  customer_name   text,
  phone           text,
  dob             date,
  package_label   text,
  status          text not null default 'new'
                  check (status in ('new', 'swar_shared', 'names_shared', 'confirmation_received', 'report_shared')),
  status_history  jsonb not null default '[]'::jsonb,   -- [{ "status": "...", "at": "...", "by": "auto" | "manual" }]
  data            jsonb not null default '{}'::jsonb    -- everything needed to re-open the case in the tool
);

create unique index if not exists swar_cases_order_id_uq on public.swar_cases (order_id) where order_id is not null;
create index if not exists swar_cases_status_idx  on public.swar_cases (status);
create index if not exists swar_cases_phone_idx   on public.swar_cases (phone);
create index if not exists swar_cases_updated_idx on public.swar_cases (updated_at desc);

create or replace function public.swar_cases_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists swar_cases_touch_trg on public.swar_cases;
create trigger swar_cases_touch_trg before update on public.swar_cases
  for each row execute function public.swar_cases_touch();

alter table public.swar_cases enable row level security;

drop policy if exists "Admins manage swar cases" on public.swar_cases;
create policy "Admins manage swar cases" on public.swar_cases
  for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
