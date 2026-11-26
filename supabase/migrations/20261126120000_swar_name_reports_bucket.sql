-- Public bucket for the Swar Calculator "names report" PDF (link goes in the Step 3 WhatsApp message).
insert into storage.buckets (id, name, public)
values ('swar-name-reports', 'swar-name-reports', true)
on conflict (id) do nothing;

create policy "swar-name-reports public read" on storage.objects
  for select using (bucket_id = 'swar-name-reports');
create policy "swar-name-reports admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'swar-name-reports' and public.has_role(auth.uid(), 'admin'));
create policy "swar-name-reports admin update" on storage.objects
  for update to authenticated using (bucket_id = 'swar-name-reports' and public.has_role(auth.uid(), 'admin'));
