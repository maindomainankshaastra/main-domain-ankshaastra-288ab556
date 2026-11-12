-- Links a Perfect / Complete report to the Swar case (and the order) it was made from.
alter table public.perfect_baby_name_reports
  add column if not exists order_id text,
  add column if not exists swar_case_id uuid;

alter table public.complete_baby_blueprint_reports
  add column if not exists order_id text,
  add column if not exists swar_case_id uuid;

create index if not exists perfect_reports_swar_case_idx on public.perfect_baby_name_reports (swar_case_id);
create index if not exists complete_reports_swar_case_idx on public.complete_baby_blueprint_reports (swar_case_id);

notify pgrst, 'reload schema';
