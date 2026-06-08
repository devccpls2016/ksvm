
-- Tighten profiles SELECT
DROP POLICY IF EXISTS profiles_select_all_auth ON public.profiles;
CREATE POLICY profiles_select_own_or_admin ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Tighten survey-photos storage SELECT
DROP POLICY IF EXISTS survey_photos_auth_read ON storage.objects;
CREATE POLICY survey_photos_owner_or_admin_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'survey-photos'
    AND (owner = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  );
