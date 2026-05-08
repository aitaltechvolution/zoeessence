
-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Clothing', 'Shoes', 'Bags', 'Accessories')),
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  description TEXT,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roles (for future admin)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Products policies: public read, admin write
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Orders policies: anyone can place an order (insert), only admins can view/update
CREATE POLICY "Anyone can place an order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User roles: users can view their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Updated_at trigger for products
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed sample products
INSERT INTO public.products (title, category, price, description, image_url, featured, tags) VALUES
('Ivory Silk Wrap Dress', 'Clothing', 65000, 'A flowing silk wrap dress crafted in ivory. Made-to-order in 5–7 working days. Timeless silhouette for evenings and ceremonies.', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&q=80', true, ARRAY['new']),
('Champagne Satin Gown', 'Clothing', 95000, 'Floor-length satin gown in champagne. Bias-cut for an effortless drape. Made-to-order.', 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=900&q=80', true, ARRAY['trending']),
('Nude Pointed Heels', 'Shoes', 45000, 'Hand-finished pointed heels in nude leather. 9cm heel.', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&q=80', true, ARRAY['new']),
('Black Strappy Sandals', 'Shoes', 38000, 'Minimalist strappy sandals in black with a sculpted block heel.', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=900&q=80', false, ARRAY[]::text[]),
('Caramel Leather Tote', 'Bags', 72000, 'Spacious caramel leather tote with suede lining. Carries everything elegantly.', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=80', true, ARRAY['trending']),
('Gold Pearl Drop Earrings', 'Accessories', 15000, 'Delicate gold-plated drops with freshwater pearl accents.', 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900&q=80', false, ARRAY['new']),
('Ivory Linen Blouse', 'Clothing', 42000, 'Crisp ivory linen blouse with mother-of-pearl buttons.', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=900&q=80', false, ARRAY[]::text[]),
('Signature Eau de Parfum', 'Accessories', 28000, 'Soft floral with notes of jasmine, vanilla and amber. 50ml.', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&q=80', false, ARRAY['trending']);
