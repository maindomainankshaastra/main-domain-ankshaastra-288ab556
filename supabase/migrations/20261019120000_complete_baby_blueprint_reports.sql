-- Complete Baby Blueprint reports: same columns as perfect_baby_name_reports.
create table if not exists public.complete_baby_blueprint_reports
  (like public.perfect_baby_name_reports including all);

alter table public.complete_baby_blueprint_reports enable row level security;

-- Copy the SAME RLS policies you have on perfect_baby_name_reports (check: select * from pg_policies where tablename = 'perfect_baby_name_reports';)

-- Storage bucket for generated PDFs (copy the same storage.objects policies as 'perfect-baby-name-reports')
insert into storage.buckets (id, name, public)
values ('complete-baby-blueprint-reports', 'complete-baby-blueprint-reports', true)
on conflict (id) do nothing;
