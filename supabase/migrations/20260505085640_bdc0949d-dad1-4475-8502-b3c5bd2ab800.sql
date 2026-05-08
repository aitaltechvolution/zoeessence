CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM authenticated;

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can view orders"
ON public.orders
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
