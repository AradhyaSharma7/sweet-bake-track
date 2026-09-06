CREATE OR REPLACE FUNCTION public.create_delivery_for_order()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.fulfilment = 'delivery' THEN
    INSERT INTO public.deliveries (order_id) VALUES (NEW.id) ON CONFLICT (order_id) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.create_delivery_for_order() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_order_created AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.create_delivery_for_order();

DROP POLICY "deliveries update" ON public.deliveries;
CREATE POLICY "deliveries update" ON public.deliveries FOR UPDATE TO authenticated
  USING (rider_id = auth.uid() OR (rider_id IS NULL AND public.has_role(auth.uid(),'rider')) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (rider_id = auth.uid() OR public.has_role(auth.uid(),'admin'));