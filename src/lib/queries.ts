import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  long_description: string;
  price: number;
  image_key: string;
  badge: string | null;
  allergens: string;
  sort_order: number;
};

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as unknown as Product[];
  },
  staleTime: 5 * 60 * 1000,
});

export function productBySlug(products: Product[] | undefined, slug: string) {
  return products?.find((p) => p.slug === slug);
}

export type OrderRow = {
  id: string;
  user_id: string;
  rider_id: string | null;
  status: string;
  fulfilment: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  dest_lat: number | null;
  dest_lng: number | null;
  total: number;
  advance_paid: number;
  slot: string;
  created_at: string;
};

export const myOrdersQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["orders", "mine", userId],
    enabled: !!userId,
    queryFn: async (): Promise<OrderRow[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrderRow[];
    },
  });

export const orderQuery = (orderId: string) =>
  queryOptions({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), deliveries(*)")
        .eq("id", orderId)
        .maybeSingle();
      if (error) throw error;
      return data as never;
    },
  });

export function statusLabel(status: string) {
  switch (status) {
    case "placed":
      return "Order placed";
    case "preparing":
      return "In the oven";
    case "ready":
      return "Ready";
    case "out_for_delivery":
      return "Out for delivery";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
