CREATE TYPE public.app_role AS ENUM ('admin','rider','customer');
CREATE TYPE public.order_status AS ENUM ('placed','preparing','ready','out_for_delivery','delivered','cancelled');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  long_description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  image_key TEXT NOT NULL,
  badge TEXT,
  allergens TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.order_status NOT NULL DEFAULT 'placed',
  fulfilment TEXT NOT NULL DEFAULT 'delivery',
  customer_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  dest_lat DOUBLE PRECISION,
  dest_lng DOUBLE PRECISION,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  advance_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  slot TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  flavour TEXT NOT NULL DEFAULT '',
  weight TEXT NOT NULL DEFAULT '',
  design_notes TEXT NOT NULL DEFAULT ''
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  rider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rider_name TEXT NOT NULL DEFAULT '',
  rider_phone TEXT NOT NULL DEFAULT '',
  is_sharing BOOLEAN NOT NULL DEFAULT false,
  last_lat DOUBLE PRECISION,
  last_lng DOUBLE PRECISION,
  last_seen_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.deliveries TO authenticated;
GRANT ALL ON public.deliveries TO service_role;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.delivery_locations (
  id BIGSERIAL PRIMARY KEY,
  delivery_id UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.delivery_locations TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.delivery_locations_id_seq TO authenticated;
GRANT ALL ON public.delivery_locations TO service_role;
GRANT ALL ON SEQUENCE public.delivery_locations_id_seq TO service_role;
ALTER TABLE public.delivery_locations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.consent_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  invoice_no TEXT NOT NULL DEFAULT '',
  order_date TEXT NOT NULL DEFAULT '',
  delivery_datetime TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL DEFAULT '',
  flavour TEXT NOT NULL DEFAULT '',
  weight TEXT NOT NULL DEFAULT '',
  design_theme TEXT NOT NULL DEFAULT '',
  special_instructions TEXT NOT NULL DEFAULT '',
  approve_design BOOLEAN NOT NULL DEFAULT false,
  accept_handmade_variation BOOLEAN NOT NULL DEFAULT false,
  allergies TEXT NOT NULL DEFAULT '',
  informed_allergies BOOLEAN NOT NULL DEFAULT false,
  accept_allergen_environment BOOLEAN NOT NULL DEFAULT false,
  accept_no_allergen_free_guarantee BOOLEAN NOT NULL DEFAULT false,
  fulfilment TEXT NOT NULL DEFAULT 'delivery',
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  advance_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(10,2) NOT NULL DEFAULT 0,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  customer_signature TEXT NOT NULL DEFAULT '',
  customer_signed_name TEXT NOT NULL DEFAULT '',
  rep_signature TEXT NOT NULL DEFAULT '',
  rep_name TEXT NOT NULL DEFAULT '',
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  bakery_notes TEXT NOT NULL DEFAULT '',
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.consent_forms TO authenticated;
GRANT ALL ON public.consent_forms TO service_role;
ALTER TABLE public.consent_forms ENABLE ROW LEVEL SECURITY;

-- policies
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "products are public" ON public.products FOR SELECT TO anon, authenticated USING (is_active);

CREATE POLICY "orders read" ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR rider_id = auth.uid() OR public.has_role(auth.uid(),'admin')
         OR (rider_id IS NULL AND public.has_role(auth.uid(),'rider')));
CREATE POLICY "orders insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders update" ON public.orders FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR rider_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR (rider_id IS NULL AND public.has_role(auth.uid(),'rider')))
  WITH CHECK (user_id = auth.uid() OR rider_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'rider'));

CREATE POLICY "order items read" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.rider_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'rider'))));
CREATE POLICY "order items insert" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE POLICY "deliveries read" ON public.deliveries FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.rider_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'rider'))));
CREATE POLICY "deliveries write" ON public.deliveries FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'rider') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "deliveries update" ON public.deliveries FOR UPDATE TO authenticated
  USING (rider_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (rider_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "locations read" ON public.delivery_locations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.deliveries d JOIN public.orders o ON o.id = d.order_id
                 WHERE d.id = delivery_id AND (o.user_id = auth.uid() OR o.rider_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "locations insert" ON public.delivery_locations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.deliveries d WHERE d.id = delivery_id AND d.rider_id = auth.uid()));

CREATE POLICY "consent read" ON public.consent_forms FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.rider_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "consent insert" ON public.consent_forms FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.rider_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "consent update" ON public.consent_forms FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.rider_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.rider_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

-- new users get a profile and the customer role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), COALESCE(NEW.email,''), COALESCE(NEW.raw_user_meta_data->>'phone',''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role','customer') = 'rider' THEN 'rider'::public.app_role ELSE 'customer'::public.app_role END)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

INSERT INTO public.products (slug,name,category,description,long_description,price,image_key,badge,allergens,sort_order) VALUES
('country-sourdough','Country Sourdough','Breads','36-hour wild starter, blistered crust, open crumb.','Fed twice daily and rested overnight, this loaf carries a deep tang and a chewy, open crumb under a dark blistered crust.',320,'sourdough','Bestseller','Wheat/Gluten',1),
('rustic-baguette','Rustic Baguette','Breads','Crackling crust, tender centre, baked twice daily.','Slow-fermented French dough shaped by hand and baked on stone for a shattering crust.',180,'baguette',NULL,'Wheat/Gluten',2),
('multigrain-loaf','Multigrain Seeded Loaf','Breads','Five grains, sunflower and flax, soft honey crumb.','A hearty sandwich loaf packed with oats, millet, flax and sunflower seeds.',280,'multigrain',NULL,'Wheat/Gluten, Sesame, Seeds',3),
('rosemary-focaccia','Rosemary Focaccia','Breads','Dimpled, olive-oil rich, sea salt and rosemary.','Baked in trays with cold-pressed olive oil, flaky salt and fresh rosemary.',260,'focaccia',NULL,'Wheat/Gluten',4),
('dark-rye','Dark Rye Loaf','Breads','Molasses-dark rye with a dense, moist crumb.','A northern-style rye with cocoa and molasses depth. Keeps beautifully for days.',300,'rye',NULL,'Wheat/Gluten, Rye',5),
('braided-brioche','Braided Brioche','Breads','Buttery, feather-light braid with a glossy crust.','Enriched with cultured butter and eggs, then braided and egg-washed twice.',340,'brioche',NULL,'Wheat/Gluten, Milk, Eggs',6),
('milk-bread','Soft Milk Bread','Breads','Cloud-soft tangzhong loaf for perfect toast.','A pillowy Japanese-style milk bread that stays soft for days.',240,'milkbread',NULL,'Wheat/Gluten, Milk',7),
('butter-croissant','Butter Croissant','Pastries','72 flaky layers folded around French cultured butter.','Laminated over three days and baked each morning at six.',150,'croissant','Baked at 6am','Wheat/Gluten, Milk',8),
('pain-au-chocolat','Pain au Chocolat','Pastries','Two batons of dark chocolate in buttery layers.','The same croissant dough wrapped around 62% dark chocolate.',170,'painauchocolat',NULL,'Wheat/Gluten, Milk, Soy',9),
('cinnamon-roll','Cinnamon Roll','Pastries','Soft brioche swirl with cream-cheese glaze.','Rolled with cinnamon sugar and finished with a tangy cream-cheese glaze.',180,'cinnamonroll',NULL,'Wheat/Gluten, Milk, Eggs',10),
('almond-danish','Almond Danish','Pastries','Frangipane centre, toasted flakes, icing sugar.','Filled with house-made almond frangipane and showered in toasted flakes.',190,'danish',NULL,'Wheat/Gluten, Milk, Eggs, Nuts',11),
('veg-puff','Masala Veg Puff','Pastries','Spiced potato and pea filling in crisp puff pastry.','Our savoury teatime favourite, baked fresh through the afternoon.',80,'vegpuff',NULL,'Wheat/Gluten, Milk',12),
('chocolate-fudge-cake','Chocolate Fudge Cake','Cakes','Three dark cocoa layers under glossy ganache.','Serves eight. Dark cocoa sponge layered with fudge and finished in ganache.',1450,'chocolatecake','Serves 8','Wheat/Gluten, Milk, Eggs, Soy',13),
('black-forest','Black Forest Gateau','Cakes','Cherries, kirsch cream and dark chocolate curls.','A classic gateau with morello cherries and lightly whipped cream.',1550,'blackforest',NULL,'Wheat/Gluten, Milk, Eggs',14),
('baked-cheesecake','New York Cheesecake','Cakes','Dense vanilla cheesecake on a butter biscuit base.','Slow-baked and chilled overnight for a silky, dense slice.',1350,'cheesecake',NULL,'Wheat/Gluten, Milk, Eggs',15),
('red-velvet-cupcake','Red Velvet Cupcake','Cakes','Velvet crumb crowned with cream-cheese swirl.','Cocoa-kissed sponge with a generous cream-cheese swirl.',120,'cupcake',NULL,'Wheat/Gluten, Milk, Eggs',16),
('celebration-cake','Custom Celebration Cake','Cakes','Your flavour, weight and design, made to order.','Tell us the flavour, weight and theme. Custom cakes need 48 hours notice and a signed design consent.',1800,'celebration','Made to order','Wheat/Gluten, Milk, Eggs, may contain nuts',17),
('choc-chip-cookies','Chocolate Chip Cookies','Cookies','Brown-butter dough, sea salt, molten chip pockets.','Box of four. Brown butter, dark chips and a flake of sea salt.',140,'cookies',NULL,'Wheat/Gluten, Milk, Eggs, Soy',18),
('almond-macarons','Almond Macarons','Cookies','Box of six, crisp shells and silky ganache centres.','Six shells in the day''s flavours with silky ganache centres.',520,'macarons','Box of 6','Milk, Eggs, Nuts',19),
('butter-shortbread','Butter Shortbread','Cookies','Crumbly Scottish-style fingers, lightly salted.','Only butter, sugar, flour and salt — baked pale and sandy.',160,'shortbread',NULL,'Wheat/Gluten, Milk',20);