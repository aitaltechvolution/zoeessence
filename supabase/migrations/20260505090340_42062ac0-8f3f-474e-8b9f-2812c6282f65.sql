GRANT USAGE ON SCHEMA private TO authenticated;
GRANT USAGE ON TYPE public.app_role TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;