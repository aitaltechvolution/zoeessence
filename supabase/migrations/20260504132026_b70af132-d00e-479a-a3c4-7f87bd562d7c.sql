
-- Fix search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Restrict execute on has_role (RLS still uses it via security definer internally)
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;

-- Replace overly permissive orders insert policy with one that requires basic sanity
DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;
CREATE POLICY "Public can place valid orders" ON public.orders
FOR INSERT
WITH CHECK (
  length(customer_name) BETWEEN 2 AND 120
  AND length(email) BETWEEN 5 AND 255
  AND email LIKE '%_@_%.__%'
  AND length(phone) BETWEEN 5 AND 30
  AND length(delivery_location) BETWEEN 3 AND 500
  AND quantity > 0 AND quantity <= 100
  AND unit_price >= 0
  AND total >= 0
  AND total = unit_price * quantity
  AND status = 'pending'
);
