-- Public bucket for generated C-Section PDF reports (link is sent to the customer on WhatsApp).
insert into storage.buckets (id, name, public)
values ('c-section-reports', 'c-section-reports', true)
on conflict (id) do nothing;

-- Same storage.objects policies as 'perfect-baby-name-reports': admins can upload, anyone can read the public link.
create policy "c-section-reports public read" on storage.objects
  for select using (bucket_id = 'c-section-reports');
create policy "c-section-reports admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'c-section-reports' and public.has_role(auth.uid(), 'admin'));
create policy "c-section-reports admin update" on storage.objects
  for update to authenticated using (bucket_id = 'c-section-reports' and public.has_role(auth.uid(), 'admin'));
