-- Lets admins delete the PDF file of a report from the history list.
create policy "c-section-reports admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'c-section-reports' and public.has_role(auth.uid(), 'admin'));
