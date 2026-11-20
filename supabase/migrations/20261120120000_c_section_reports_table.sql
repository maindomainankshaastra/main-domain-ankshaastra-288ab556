-- History of generated C-Section reports (shown under the calculator).
create table if not exists public.c_section_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  mother_name text not null,
  father_name text not null,
  phone text,
  hospital text,
  city text,
  window_start date not null,
  window_end date not null,
  top_dates text,
  pdf_path text not null,
  pdf_url text not null,
  whatsapp_sent_at timestamptz
);

alter table public.c_section_reports enable row level security;

create policy "c_section_reports admin all" on public.c_section_reports
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
