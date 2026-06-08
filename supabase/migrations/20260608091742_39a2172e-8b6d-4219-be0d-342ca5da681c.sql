CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

DELETE FROM public.user_roles ur
USING public.profiles p
WHERE ur.user_id = p.id
  AND lower(p.email) = 'admin@gmail.com'
  AND ur.role = 'surveyor'::public.app_role
  AND EXISTS (
    SELECT 1
    FROM public.user_roles admin_role
    WHERE admin_role.user_id = ur.user_id
      AND admin_role.role = 'admin'::public.app_role
  );

INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'surveyor'::public.app_role
FROM public.profiles p
WHERE lower(coalesce(p.email, '')) <> 'admin@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id
  )
ON CONFLICT DO NOTHING;