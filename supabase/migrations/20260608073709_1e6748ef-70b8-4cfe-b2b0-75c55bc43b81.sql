
-- fix search_path + lock down execute on helper functions
alter function public.touch_updated_at() set search_path = public;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

-- storage policies for survey-photos bucket (private bucket; signed URLs used in app)
create policy "survey_photos_auth_read" on storage.objects for select to authenticated
  using (bucket_id = 'survey-photos');
create policy "survey_photos_auth_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'survey-photos' and owner = auth.uid());
create policy "survey_photos_owner_update" on storage.objects for update to authenticated
  using (bucket_id = 'survey-photos' and (owner = auth.uid() or public.has_role(auth.uid(), 'admin')));
create policy "survey_photos_owner_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'survey-photos' and (owner = auth.uid() or public.has_role(auth.uid(), 'admin')));
